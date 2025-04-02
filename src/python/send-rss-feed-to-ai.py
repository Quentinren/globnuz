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
logger = logging.getLogger("supabase-news-processor")

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

class NewsProcessor:
    def __init__(self, openai_api_key: str, supabase_url: str, supabase_key: str, raw_table: str, processed_table: str):
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
        self.raw_table = raw_table
        self.processed_table = processed_table
        self.openai_api_key = openai_api_key

    def fetch_unprocessed_news(self) -> List[Dict[str, Any]]:
        """Fetch unprocessed news articles from Supabase"""
        logger.info(f"Fetching unprocessed news from {self.raw_table}")
        try:
            supabase_endpoint = f"{self.supabase_url}/rest/v1/{self.raw_table}"
            headers = {
                "apikey": self.supabase_key,
                "Authorization": f"Bearer {self.supabase_key}",
                "Content-Type": "application/json"
            }
            
            # Build query parameters to get 5 unprocessed rows
            query_params = {
                "select": "*",
                "ai_processed": "eq.false",
                "limit": "5",
                "order": "publication_date.desc"
            }
            
            url = f"{supabase_endpoint}?{urllib.parse.urlencode(query_params)}"
            req = urllib.request.Request(url, headers=headers, method="GET")
            
            with urllib.request.urlopen(req) as response:
                articles = json.loads(response.read().decode())
            
            logger.debug(f"Successfully fetched {len(articles)} unprocessed articles")
            return articles
        except Exception as e:
            logger.error(f"Error fetching unprocessed news: {str(e)}")
            raise

    def process_articles_with_chatgpt(self, articles) -> List[Dict[str, Any]]:
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
                {"role": "user", "content": json.dumps(articles)}
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
            logger.error(f"Error processing articles with ChatGPT: {str(e)}")
            raise

    def insert_processed_articles(self, processed_articles: List[Dict[str, Any]]) -> None:
        """Insert processed articles into the news_articles table"""
        if not processed_articles:
            logger.warning("No processed articles to insert")
            return
        
        logger.info(f"Inserting {len(processed_articles)} processed articles into {self.processed_table}")
        supabase_endpoint = f"{self.supabase_url}/rest/v1/{self.processed_table}"
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        
        req = urllib.request.Request(supabase_endpoint, data=json.dumps(processed_articles).encode(), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req) as response:
                logger.debug(f"Successfully inserted processed articles into {self.processed_table}")
                return True
        except urllib.error.HTTPError as e:
            error_response = e.read().decode()
            logger.error(f"Supabase API Error {e.code}: {error_response}")
            raise
        except Exception as e:
            logger.error(f"Error inserting processed articles: {str(e)}")
            raise

    def update_raw_articles(self, article_ids: List[int]) -> None:
        """Update the original articles to mark them as processed"""
        if not article_ids:
            logger.warning("No article IDs to update")
            return
        
        logger.info(f"Updating {len(article_ids)} articles in {self.raw_table} as processed")
        
        current_time = datetime.utcnow().isoformat()
        
        for article_id in article_ids:
            supabase_endpoint = f"{self.supabase_url}/rest/v1/{self.raw_table}"
            headers = {
                "apikey": self.supabase_key,
                "Authorization": f"Bearer {self.supabase_key}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            }
            
            # Build query parameters to target the specific article
            query_params = {
                "id": f"eq.{article_id}"
            }
            
            # Data to update
            update_data = {
                "ai_processed": True,
                "ai_processed_date": current_time
            }
            
            url = f"{supabase_endpoint}?{urllib.parse.urlencode(query_params)}"
            req = urllib.request.Request(
                url, 
                data=json.dumps(update_data).encode(), 
                headers=headers, 
                method="PATCH"
            )
            
            try:
                with urllib.request.urlopen(req) as response:
                    logger.debug(f"Successfully updated article ID {article_id} as processed")
            except urllib.error.HTTPError as e:
                error_response = e.read().decode()
                logger.error(f"Supabase API Error updating article {article_id}: {e.code}: {error_response}")
                raise
            except Exception as e:
                logger.error(f"Error updating article {article_id}: {str(e)}")
                raise

    def process(self) -> None:
        """Main processing method to fetch news, process them, and update databases"""
        try:
            # Step 1: Fetch unprocessed news articles
            raw_articles = self.fetch_unprocessed_news()
            
            if not raw_articles:
                logger.info("No unprocessed articles found")
                return
            
            # Step 2: Process articles with ChatGPT
            processed_articles = self.process_articles_with_chatgpt(raw_articles)
            
            if processed_articles:
                # Step 3: Insert processed articles into news_articles table
                insert_success = self.insert_processed_articles(processed_articles)
                
                if insert_success:
                    # Step 4: Update original articles as processed
                    article_ids = [article['id'] for article in raw_articles]
                    self.update_raw_articles(article_ids)
                    
                    logger.info(f"Successfully processed and updated {len(processed_articles)} articles")
                else:
                    logger.warning("Failed to insert processed articles, skipping update of raw articles")
            else:
                logger.warning("No articles were successfully processed")
        except Exception as e:
            logger.error(f"Error in main processing flow: {str(e)}")
            raise


def lambda_handler(event, context):
    """AWS Lambda handler function"""
    try:
        supabase_url = os.environ.get('SUPABASE_URL')
        supabase_key = os.environ.get('SUPABASE_KEY')
        raw_table = os.environ.get('SUPABASE_RAW_TABLE', 'news_articles_raw')
        processed_table = os.environ.get('SUPABASE_PROCESSED_TABLE', 'news_articles')
        openai_api_key = os.environ.get('OPENAI_API_KEY')
        
        if not all([supabase_url, supabase_key, openai_api_key]):
            missing = [k for k, v in {
                'supabase_url': supabase_url,
                'supabase_key': supabase_key,
                'openai_api_key': openai_api_key
            }.items() if not v]
            return {'statusCode': 400, 'body': json.dumps({'status': 'error', 'message': f'Missing required parameters: {", ".join(missing)}'})}
        
        logger.info("Starting news processing from Supabase")

        processor = NewsProcessor(openai_api_key, supabase_url, supabase_key, raw_table, processed_table)
        processor.process()
        
        return {'statusCode': 200, 'body': json.dumps({'status': 'success', 'message': 'News articles processed successfully'})}
    except Exception as e:
        logger.error(f"Lambda execution error: {str(e)}")
        return {'statusCode': 500, 'body': json.dumps({'status': 'error', 'message': str(e)})}

def main():
    """Main entry point function to process unprocessed news articles"""
    parser = argparse.ArgumentParser(description='Process news articles from Supabase')
    parser.add_argument('--supabase-url', required=True, help='Supabase project URL')
    parser.add_argument('--supabase-key', required=True, help='Supabase API key')
    parser.add_argument('--raw-table', default='news_articles_raw', help='Supabase raw articles table name')
    parser.add_argument('--processed-table', default='news_articles', help='Supabase processed articles table name')
    parser.add_argument('--openai-api-key', required=True, help='OpenAI API key')
    
    args = parser.parse_args()
    processor = NewsProcessor(
        args.openai_api_key,
        args.supabase_url, 
        args.supabase_key, 
        args.raw_table,
        args.processed_table
    )
    processor.process()
    
if __name__ == "__main__":
    main()