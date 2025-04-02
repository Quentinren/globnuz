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
logger = logging.getLogger("get-rss-news-raw")

def extract_image_from_description(description: str) -> str:
    match = re.search(r'<img[^>]+src="([^">]+)"', description)
    return match.group(1) if match else None

class RSSProcessor:
    def __init__(self, newspaper_id: int, supabase_url: str, supabase_key: str, supabase_table: str):
        self.newspaper_id = newspaper_id
        self.supabase_key = supabase_key
        self.supabase_table = supabase_table


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
                    "description": item.findtext("description"),
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
        newspaper_id = event.get('newspaper_id')
        supabase_url = os.environ.get('SUPABASE_URL')
        supabase_key = os.environ.get('SUPABASE_KEY')
        supabase_table = os.environ.get('SUPABASE_TABLE_EVENTS_RAW')

        
        if not all([rss_url, supabase_url, supabase_key, supabase_table]):
            missing = [k for k, v in {
                'newspaper_id': newspaper_id,
                'supabase_url': supabase_url,
                'supabase_key': supabase_key,
                'supabase_table': supabase_table,
            }.items() if not v]
            return {'statusCode': 400, 'body': json.dumps({'status': 'error', 'message': f'Missing required parameters: {", ".join(missing)}'})}
        
        logger.info(f"Processing RSS URL: {rss_url}")

        processor = RSSProcessor(rss_url, newspaper_id, openai_api_key, supabase_url, supabase_key, supabase_table)
        processor.process()
        
        return {'statusCode': 200, 'body': json.dumps({'status': 'success', 'message': 'RSS feed processed successfully'})}
    except Exception as e:
        logger.error(f"Lambda execution error: {str(e)}")
        return {'statusCode': 500, 'body': json.dumps({'status': 'error', 'message': str(e)})}

