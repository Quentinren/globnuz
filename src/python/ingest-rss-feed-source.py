import argparse
import json
import re
import os
import logging
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("rss-to-supabase")

def extract_json_from_markdown(content):
    """Extract JSON data from Markdown-style content wrapped in ```json ... ```."""
    json_data_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
    
    if json_data_match:
        try:
            return json.loads(json_data_match.group(1))  # Convert string to JSON
        except json.JSONDecodeError:
            return None  # Return None if JSON is invalid
    return None  # Return None if no JSON block is found

def extract_json_from_string(content):
    """Extract JSON data when it's stored as a string inside the event."""
    try:
        return json.loads(content)  # Convert directly from string to JSON
    except json.JSONDecodeError:
        return None  # Return None if JSON is invalid

def extract_image_from_description(description: str) -> str:
    match = re.search(r'<img[^>]+src="([^">]+)"', description)
    return match.group(1) if match else None

class RSSProcessor:
    def __init__(self, rss_url: str, newspaper_id: int,openai_api_key: str, supabase_url: str, supabase_key: str, supabase_table: str):
        self.rss_url = rss_url
        self.newspaper_id = newspaper_id
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
        self.supabase_table = supabase_table
        self.openai_api_key = openai_api_key


    def fetch_rss_data(self) -> List[Dict[str, Any]]:
        """Fetch and parse the RSS feed"""
        logger.info(f"Fetching RSS feed from {self.rss_url}")
        try:
            with urllib.request.urlopen(self.rss_url) as response:
                xml_data = response.read().decode()
            root = ET.fromstring(xml_data)
            
            entries = []
            # Define namespace mapping
            namespaces = {"media": "http://search.yahoo.com/mrss/"}

            # LIMIT OF TWO NOT ON PRODUCTION [:2]
            for item in root.findall(".//item"):
                description = item.findtext("description") or ""
                # Extract image from different possible locations
                image_url = (
                    item.find("enclosure").get("url") if item.find("enclosure") is not None else None
                ) or (
                    item.find("media:content", namespaces).get("url") if item.find("media:content", namespaces) is not None else None
                ) or (
                    extract_image_from_description(description)
                )

                entry = {
                    "title": item.findtext("title"),
                    "external_link": item.findtext("link"),
                    "publication_date": item.findtext("pubDate"),
                    "description": item.findtext("description"),
                    "image": image_url,
                    "newspaper_id": self.newspaper_id,
                    
                }
                logger.info(entry)
                entries.append(entry)
            
            logger.debug(f"Successfully fetched {len(entries)} entries")
            logger.debug(f"Entries : {entries}")
            return entries
        except Exception as e:
            logger.error(f"Error fetching RSS feed: {str(e)}")
            raise

    def process_entry_with_chatgpt(self, entries) -> List[Dict[str, Any]]:
        prompt = """I'm a developer who wants to feed it's news website with fresh newspaper articles from all around the world. I use RSS feed. Please get all that data and try to fit this data JSON model. Here's an example : 
            {
            "title": "Solidarité Congo",
            "subtitle": "Un concert caritatif fait polémique",
            "description": "En France, l'événement caritatif \"Solidarité Congo\" prévu le 7 avril à Paris suscite des tensions. En cause, la date choisie par les organisateurs qui correspond à la Journée de commémoration du génocide des Tutsi",
            "author": "Henri Prapon",
            "theme" : "geopolitic",
            "theme_tags" : { "conflict", "war", "ukraine"},
            "image": "https://s.france24.com/media/display/1313fc74-0af8-11f0-b064-005056a97e36/w:1024/p:16x9/Miniature%20-%2016x9.jpg",
            "external_link": "https://www.france24.com/fr/vid%C3%A9o/20250327-solidarit%C3%A9-congo-un-concert-caritatif-fait-pol%C3%A9mique",
            "publication_date": "Thu, 27 Mar 2025 11:34:20 GMT",
            "location": "Paris",
            "language": "FR",
            "country_id": "UA",
            "newspaper_id": 3,              
            "minimal_age": 18,
            "latitude": 48.8566,
            "longitude": 2.3522
            },

            Try to guess location from title, create a subtitle from title if not exists and content or summary, description or other indices found. When do so, add latitude and longitude coordinates from what you find on the net. If title is in one part, try to slice it with big title in title JSON field, the other part in subtitle. Remove all escapes at the beginning and at the end, remove caracters like : or -
            If you find any article that seems like copyright alert, please remove it. Get me JSON like API result format.
            Once you've done that, add a theme in minimal letters singular english like geopolitic, economy, society, culture, science, health, environment. Then add theme_tags : ia, nuclear fusion, ukraine war, conflict, drugs, medicins, etc. Add multiple tags if needed from 5 to 10. Guess the minimal age the readers should have to read the content and add the language of the title and description.

            And now the JSON I need you to process at least 5 articles with all that steps :"""

        url = "https://api.openai.com/v1/chat/completions"

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.openai_api_key}"
        }

        data = json.dumps({
            "model": "gpt-4-turbo",
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": json.dumps(entries)}
            ],
            "temperature": 0.7
        }).encode("utf-8")

        req = urllib.request.Request(url, data=data, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req) as response:
                response_data = json.loads(response.read().decode('utf-8'))  # Convert string to JSON

                if not response_data:
                    logger.error("OpenAI returned an empty response.")
                    return []

                # Extract the content from OpenAI's response
                chatgpt_content = response_data.get('choices', [{}])[0].get('message', {}).get('content', '')

                logger.warning(f"ChatGPT content : {chatgpt_content}")
                if not chatgpt_content:
                    logger.error("No valid content found in OpenAI response.")
                    return []

                # Extract JSON from Markdown-style content (if present)
                extracted_json = extract_json_from_markdown(chatgpt_content)
                if extracted_json is None:
                    extracted_json = extract_json_from_string(chatgpt_content)

                if not extracted_json:
                    logger.error("No valid JSON found in OpenAI response.")
                    return []

                print(f"Extracted JSON: {extracted_json}")
                logger.debug(f"Extracted JSON: {extracted_json}")

                # Ensure extracted_json is a list
                if isinstance(extracted_json, dict):
                    extracted_json = [extracted_json]  # Convert single object to list if needed

                return extracted_json
        except urllib.error.HTTPError as e:
            error_response = e.read().decode()
            logger.error(f"OpenAI HTTP Error {e.code}: {error_response}")
            raise
        except Exception as e:
            logger.error(f"Error processing entry with ChatGPT: {str(e)}")
            raise
            return {
                "statusCode": 500,
                "body": f"Error processing entry with ChatGPT: {str(e)}"
            }

    def upload_to_supabase(self, data: List[Dict[str, Any]]) -> None:
        """Upload processed data to Supabase"""
        if not data:
            logger.warning("No data to upload to Supabase")
            return
        
        logger.info(f"Uploading {len(data)} entries to Supabase")
        supabase_endpoint = f"{self.supabase_url}/rest/v1/{self.supabase_table}"
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        
        req = urllib.request.Request(supabase_endpoint, data=json.dumps(data).encode(), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req) as response:
                logger.debug("Successfully uploaded data to Supabase")
        except urllib.error.HTTPError as e:
            error_response = e.read().decode()
            print("Supabase Error:", error_response)  
            raise Exception(f"Supabase API Error {e.code}: {error_response}")  # 🚨 Stop execution
            return {
                "statusCode": 500,
                "body": f"Supabase API Error {e.code}: {error_response}"
            }      
        except Exception as e:
            logger.error(f"Supabase URL: {self.supabase_url}")
            logger.error(f"Data being integrated: {json.dumps(data)[:500]}...")  # Log only first 500 chars
            logger.error(f"Error uploading to Supabase: {str(e)}")
            raise
            return {
                "statusCode": 500,
                "body": f"Error uploading to Supabase: {str(e)}"
            }

    def process(self) -> None:
        """Main processing method to fetch RSS and upload to Supabase"""
        try:
            entries = self.fetch_rss_data()
            entries_formatted = self.process_entry_with_chatgpt(entries)
            if entries_formatted:                
                self.upload_to_supabase(entries_formatted)
                logger.debug(f"Successfully processed {len(entries_formatted)} entries")
            else:
                logger.warning("No entries were successfully processed")
        except Exception as e:
            logger.error(f"Error in main processing flow: {str(e)}")
            raise


def lambda_handler(event, context):
    """AWS Lambda handler function"""
    try:
        rss_url = event.get('rss_url')
        newspaper_id = event.get('newspaper_id')
        supabase_url = os.environ.get('SUPABASE_URL')
        supabase_key = os.environ.get('SUPABASE_KEY')
        supabase_table = os.environ.get('SUPABASE_TABLE')
        openai_api_key = os.environ.get('OPENAI_API_KEY')
        
        if not all([rss_url, supabase_url, supabase_key, supabase_table, openai_api_key]):
            missing = [k for k, v in {
                'rss_url': rss_url,
                'newspaper_id': newspaper_id,
                'supabase_url': supabase_url,
                'supabase_key': supabase_key,
                'supabase_table': supabase_table,
                'openai_api_key': openai_api_key
            }.items() if not v]
            return {'statusCode': 400, 'body': json.dumps({'status': 'error', 'message': f'Missing required parameters: {", ".join(missing)}'})}
        
        logger.info(f"Processing RSS URL: {rss_url}")

        processor = RSSProcessor(rss_url, newspaper_id, openai_api_key, supabase_url, supabase_key, supabase_table)
        processor.process()
        
        return {'statusCode': 200, 'body': json.dumps({'status': 'success', 'message': 'RSS feed processed successfully'})}
    except Exception as e:
        logger.error(f"Lambda execution error: {str(e)}")
        return {'statusCode': 500, 'body': json.dumps({'status': 'error', 'message': str(e)})}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Process RSS feed and upload to Supabase')
    parser.add_argument('--rss-url', required=True, help='URL of the RSS feed to process')
    parser.add_argument('--supabase-url', required=True, help='Supabase project URL')
    parser.add_argument('--supabase-key', required=True, help='Supabase API key')
    parser.add_argument('--supabase-table', required=True, help='Supabase table name')
    parser.add_argument('--openai-api-key', required=True, help='OpenAI API key')
    
    args = parser.parse_args()
    processor = RSSProcessor(
        args.rss_url, 
        args.openai_api_key, 
        args.supabase_url, 
        args.supabase_key, 
        args.supabase_table
    )
    processor.process()