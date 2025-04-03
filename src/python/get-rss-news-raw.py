import argparse
import json
import re
import os
import sys
import logging
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Capture all logs (DEBUG, INFO, WARNING, ERROR)
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]  # Ensure logs appear in AWS Lambda console
)

logger = logging.getLogger("get-rss-news-raw")

def extract_image_from_description(description: str) -> str:
    match = re.search(r'<img[^>]+src="([^">]+)"', description)
    return match.group(1) if match else None

class RSSProcessor:
    def __init__(self, newspaper_id: int, supabase_url: str, supabase_key: str, supabase_table: str):
        self.newspaper_id = newspaper_id
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
        self.supabase_table = supabase_table

    def get_rss_feed_url(self):
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json"
        }
    
        query_url = f"{self.supabase_url}/rest/v1/newspapers?id=eq.{self.newspaper_id}&select=rss_feed_url"
        req = urllib.request.Request(query_url, headers=headers, method="GET")
        try:
            with urllib.request.urlopen(req) as response:
                response_data = response.read().decode()
                logger.debug(f"Response status code: {response.status}")
                json_response = json.loads(response_data)
                logger.debug(f"Response JSON: {json_response}")
                if json_response:
                    return json_response[0].get("rss_feed_url")
        except urllib.error.HTTPError as e:
            logger.error(f"HTTP Error: {e.code}, {e.reason}")
        except urllib.error.URLError as e:
            logger.error(f"URL Error: {e.reason}")
        except Exception as e:
            logger.warning(f"Failed to fetch RSS feed URL for newspaper ID: {self.newspaper_id}, Error: {e}")
        return None

    def fetch_rss_data(self, rss_feed_url) -> List[Dict[str, Any]]:
        """Fetch and parse the RSS feed"""
        logger.info(f"Fetching RSS feed from {rss_feed_url}")
        print(f"Fetching RSS feed from {rss_feed_url}")

        try:
            with urllib.request.urlopen(rss_feed_url) as response:
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
                entries.append(entry)
            
            logger.info(f"Successfully fetched {len(entries)} entries")
            return entries
        except Exception as e:
            logger.error(f"Error fetching RSS feed: {str(e)}")
            raise

    def upload_to_supabase(self, data: List[Dict[str, Any]]) -> None:
        """Upload processed data to Supabase, skipping duplicates"""
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


        for entry in data[:5]:
            logger.info(f"Entry {entry}")
            external_link = entry.get('external_link')
            logger.info(f"Check external link {external_link}")
            query_url = f"{self.supabase_url}/rest/v1/{self.supabase_table}?external_link=eq.{urllib.parse.quote(external_link)}"
            req = urllib.request.Request(query_url, headers=headers, method="GET")

            try:
                with urllib.request.urlopen(req) as response:
                    response_data = response.read().decode()
                    logger.info(f"Response is external_link present {response_data}")
                    if response_data:
                        logger.info(f"Skipping entry with existing external_link: {external_link}")
                        continue  # Skip if the entry already exists
            except urllib.error.HTTPError as e:
                logger.error(f"HTTP Error: {e.code}, {e.reason}")
            except urllib.error.URLError as e:
                logger.error(f"URL Error: {e.reason}")
            except Exception as e:
                logger.warning(f"Error checking for duplicate external_link {external_link}: {e}")
            
            # Proceed to insert if not duplicate
            req = urllib.request.Request(supabase_endpoint, data=json.dumps(entry).encode(), headers=headers, method="POST")
            try:
                with urllib.request.urlopen(req) as response:
                    logger.info(f"Saved item {response}")
                    logger.info("Successfully uploaded data to Supabase")
            except urllib.error.HTTPError as e:
                error_response = e.read().decode()
                logger.error(f"Supabase Error: {error_response}")
                raise Exception(f"Supabase API Error {e.code}: {error_response}")  

    def process(self) -> None:
        """Main processing method to fetch RSS and upload to Supabase"""
        try:
            rss_feed_url = self.get_rss_feed_url()
            entries = self.fetch_rss_data(rss_feed_url)

            if entries:                
                self.upload_to_supabase(entries)
                logger.debug(f"Successfully processed {len(entries)} entries")
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

        if not all([newspaper_id, supabase_url, supabase_key, supabase_table]):
            missing = [k for k, v in {
                'newspaper_id': newspaper_id,
                'supabase_url': supabase_url,
                'supabase_key': supabase_key,
                'supabase_table': supabase_table,
            }.items() if not v]
            return {'statusCode': 400, 'body': json.dumps({'status': 'error', 'message': f'Missing required parameters: {", ".join(missing)}'})}
        
        processor = RSSProcessor(newspaper_id, supabase_url, supabase_key, supabase_table)
        processor.process()
        
        return {'statusCode': 200, 'body': json.dumps({'status': 'success', 'message': 'RSS feed processed successfully'})}
    except Exception as e:
        logger.error(f"Lambda execution error: {str(e)}")
        return {'statusCode': 500, 'body': json.dumps({'status': 'error', 'message': str(e)})}
