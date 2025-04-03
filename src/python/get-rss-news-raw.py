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
    level=logging.INFO,  # Using INFO instead of DEBUG to reduce verbosity
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    force=True  # This forces reconfiguration of the root logger
)

logger = logging.getLogger("get-rss-news-raw")
logger.info("Script starting")  # Test log message at the beginning

# Define common namespaces for RSS and RDF formats
NAMESPACES = {
    'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'rss': 'http://purl.org/rss/1.0/',
    'dc': 'http://purl.org/dc/elements/1.1/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'media': 'http://search.yahoo.com/mrss/',
    'atom': 'http://www.w3.org/2005/Atom'
}

def extract_image_from_description(description: str) -> str:
    """
    Extract image URL from HTML content with support for multiple image tag formats.
    Handles both double and single quotes in src attributes.
    """
    if not description:
        return None
        
    # Check for img tag with double quotes
    match = re.search(r'<img[^>]+src="([^">]+)"', description)
    if match:
        return match.group(1)
        
    # Check for img tag with single quotes
    match = re.search(r"<img[^>]+src='([^'>]+)'", description)
    if match:
        return match.group(1)
        
    # Check for figure with img inside
    match = re.search(r'<figure[^>]*>.*?<img[^>]+src="([^">]+)".*?</figure>', description, re.DOTALL)
    if match:
        return match.group(1)
        
    # Check for figure with img inside with single quotes
    match = re.search(r"<figure[^>]*>.*?<img[^>]+src='([^'>]+)'.*?</figure>", description, re.DOTALL)
    if match:
        return match.group(1)
    
    return None

class RSSProcessor:
    def __init__(self, newspaper_id: int, supabase_url: str, supabase_key: str, supabase_table: str):
        self.newspaper_id = newspaper_id
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
        self.supabase_table = supabase_table
        self.successful_entries_count = 0  # Track number of successfully processed entries
        logger.info(f"RSSProcessor initialized with newspaper_id: {newspaper_id}")

    def get_rss_feed_url(self):
        logger.info(f"Getting RSS feed URL for newspaper ID: {self.newspaper_id}")
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json"
        }
    
        query_url = f"{self.supabase_url}/rest/v1/newspapers?id=eq.{self.newspaper_id}&select=rss_feed_url"
        logger.info(f"Requesting RSS feed URL from: {query_url}")
        
        req = urllib.request.Request(query_url, headers=headers, method="GET")
        try:
            with urllib.request.urlopen(req) as response:
                response_data = response.read().decode()
                logger.info(f"Response status code: {response.status}")
                json_response = json.loads(response_data)
                logger.info(f"Response JSON: {json_response}")
                
                if not json_response:
                    logger.error(f"Empty response when fetching RSS URL for newspaper ID: {self.newspaper_id}")
                    return None
                    
                rss_url = json_response[0].get("rss_feed_url")
                if not rss_url:
                    logger.error(f"No RSS URL found for newspaper ID: {self.newspaper_id}")
                else:
                    logger.info(f"Successfully retrieved RSS URL: {rss_url}")
                
                return rss_url
        except urllib.error.HTTPError as e:
            logger.error(f"HTTP Error when fetching RSS URL: {e.code}, {e.reason}")
            error_body = e.read().decode() if hasattr(e, 'read') else 'No error body'
            logger.error(f"Error body: {error_body}")
            return None
        except urllib.error.URLError as e:
            logger.error(f"URL Error when fetching RSS URL: {e.reason}")
            return None
        except Exception as e:
            logger.error(f"Failed to fetch RSS feed URL for newspaper ID: {self.newspaper_id}, Error: {str(e)}")
            return None

    def detect_feed_type(self, root):
        """Detect whether the XML is RSS, RDF, or Atom format"""
        tag = root.tag.lower()
        
        if tag.endswith('rss'):
            return 'RSS'
        elif tag.endswith('rdf'):
            return 'RDF'
        elif tag.endswith('feed'):
            return 'ATOM'
        else:
            # Default to RSS
            return 'RSS'

    def fetch_rss_data(self, rss_feed_url) -> List[Dict[str, Any]]:
        """Fetch and parse the RSS feed with support for multiple XML formats"""
        logger.info(f"Fetching feed from {rss_feed_url}")
        
        if not rss_feed_url:
            logger.error("Feed URL is empty or None")
            return []

        try:
            logger.info(f"Opening URL: {rss_feed_url}")
            with urllib.request.urlopen(rss_feed_url) as response:
                logger.info(f"Feed fetched, status: {response.status}")
                xml_data = response.read().decode()
                logger.info(f"XML data decoded, length: {len(xml_data)}")
                
            try:
                # Attempt to fix common XML issues before parsing
                # Remove any invalid XML characters
                xml_data = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', xml_data)
                
                # Register namespaces to make parsing easier
                for prefix, uri in NAMESPACES.items():
                    ET.register_namespace(prefix, uri)
                
                root = ET.fromstring(xml_data)
                logger.info("XML parsed successfully")
                
                # Detect feed type to handle appropriately
                feed_type = self.detect_feed_type(root)
                logger.info(f"Detected feed type: {feed_type}")
                
                entries = []
                
                if feed_type == 'RSS':
                    # Standard RSS format
                    items = root.findall(".//item")
                    logger.info(f"Found {len(items)} items in RSS feed")
                    entries = self.process_rss_items(items)
                    
                elif feed_type == 'RDF':
                    # RDF format (like the sample provided)
                    # In RDF, items are usually direct children of the root
                    items = root.findall(".//{http://purl.org/rss/1.0/}item") or root.findall(".//item")
                    
                    if not items:
                        # Try with explicit namespace
                        for prefix, uri in NAMESPACES.items():
                            ns_items = root.findall(f".//{{{uri}}}item")
                            if ns_items:
                                items = ns_items
                                break
                                
                    logger.info(f"Found {len(items)} items in RDF feed")
                    entries = self.process_rdf_items(items)
                    
                elif feed_type == 'ATOM':
                    # Atom format
                    items = root.findall(".//{http://www.w3.org/2005/Atom}entry") or root.findall(".//entry")
                    logger.info(f"Found {len(items)} entries in Atom feed")
                    entries = self.process_atom_items(items)
                
                logger.info(f"Successfully fetched {len(entries)} entries")
                return entries
                
            except ET.ParseError as e:
                logger.error(f"XML parsing error: {str(e)}")
                logger.error(f"First 500 chars of XML: {xml_data[:500]}")
                raise
        except urllib.error.HTTPError as e:
            logger.error(f"HTTP Error while fetching feed: {e.code}, {e.reason}")
            raise
        except urllib.error.URLError as e:
            logger.error(f"URL Error while fetching feed: {e.reason}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error fetching feed: {str(e)}")
            raise
    
    def process_rss_items(self, items):
        """Process standard RSS items"""
        entries = []
        
        for item in items:
            try:
                # Skip empty items
                if len(list(item)) == 0:
                    logger.info("Skipping empty item")
                    continue
                    
                # Extract core fields with fallbacks for different formats
                title = (
                    item.findtext("title") or 
                    ""
                )
                
                # Skip items without title
                if not title:
                    logger.warning("Skipping item without title")
                    continue
                
                description = (
                    item.findtext("description") or 
                    item.findtext("summary") or 
                    item.findtext("content") or 
                    ""
                )
                
                link = (
                    item.findtext("link") or 
                    item.findtext("guid") or 
                    ""
                )
                
                # Skip items without link
                if not link:
                    logger.warning(f"Skipping item without link: {title}")
                    continue
                
                # Parse publication date with multiple formats
                pub_date = (
                    item.findtext("pubDate") or 
                    item.findtext("pubdate") or 
                    item.findtext("published") or
                    item.findtext("date") or
                    ""
                )
                
                # Look for images in multiple potential locations
                image_url = None
                
                # Check for enclosure
                if item.find("enclosure") is not None:
                    image_url = item.find("enclosure").get("url")
                
                # Check for media:content
                elif item.find(f"{{{NAMESPACES['media']}}}content") is not None:
                    image_url = item.find(f"{{{NAMESPACES['media']}}}content").get("url")
                
                # Check for image in content
                elif item.findtext("content"):
                    image_url = extract_image_from_description(item.findtext("content"))
                
                # Check for image in description
                elif description:
                    image_url = extract_image_from_description(description)
                    
                # Extract additional fields if available
                author = (
                    item.findtext("author") or 
                    item.findtext("AuthorName") or 
                    item.findtext("creator") or 
                    item.findtext(f"{{{NAMESPACES['dc']}}}creator") or
                    ""
                )
                
                category = (
                    item.findtext("category") or 
                    ""
                )
                
                # Get content from various possible tags
                content = (
                    item.findtext("content") or 
                    item.findtext(f"{{{NAMESPACES['content']}}}encoded") or 
                    description
                )
                
                # Create entry with standard fields
                entry = {
                    "title": title,
                    "description": description,
                    "external_link": link,
                    "publication_date": pub_date,
                    "image": image_url,
                    "newspaper_id": self.newspaper_id,
                    "author": author,
                    "category": category,
                    "content": content,
                    "is_processed": False
                }
                
                entries.append(entry)
                logger.info(f"Processed RSS item: {entry['title']}")
            except Exception as e:
                logger.error(f"Error processing RSS item: {str(e)}")
                import traceback
                logger.error(traceback.format_exc())
                continue
                
        return entries
        
    def process_rdf_items(self, items):
        """Process RDF format items"""
        entries = []
        
        for item in items:
            try:
                # Get item attributes - this often contains the URL in RDF format
                item_about = item.get(f"{{{NAMESPACES['rdf']}}}about") or item.get("about")
                
                title = (
                    item.findtext("title") or 
                    item.findtext(f"{{{NAMESPACES['rss']}}}title") or
                    ""
                )
                
                # Skip items without title
                if not title:
                    logger.warning("Skipping RDF item without title")
                    continue
                
                description = (
                    item.findtext("description") or 
                    item.findtext(f"{{{NAMESPACES['rss']}}}description") or
                    ""
                )
                
                # In RDF, the link might be the rdf:about attribute if not specified directly
                link = (
                    item.findtext("link") or 
                    item.findtext(f"{{{NAMESPACES['rss']}}}link") or
                    item_about or
                    ""
                )
                
                # Skip items without link
                if not link:
                    logger.warning(f"Skipping RDF item without link: {title}")
                    continue
                
                # RDF often uses Dublin Core (dc) for dates
                pub_date = (
                    item.findtext(f"{{{NAMESPACES['dc']}}}date") or
                    item.findtext("pubDate") or 
                    ""
                )
                
                # Look for images
                image_url = None
                
                # Extract additional fields from Dublin Core
                author = (
                    item.findtext(f"{{{NAMESPACES['dc']}}}creator") or
                    ""
                )
                
                category = (
                    item.findtext(f"{{{NAMESPACES['dc']}}}subject") or
                    item.findtext("category") or
                    ""
                )
                
                # Get language if available
                language = (
                    item.findtext(f"{{{NAMESPACES['dc']}}}language") or
                    ""
                )
                
                # Create entry with standard fields
                entry = {
                    "title": title,
                    "description": description,
                    "external_link": link,
                    "publication_date": pub_date,
                    "image": image_url,
                    "newspaper_id": self.newspaper_id,
                    "author": author,
                    "category": category,
                    "language": language,
                    "is_processed": False
                }
                
                # Add image from description if available
                if description:
                    image_from_desc = extract_image_from_description(description)
                    if image_from_desc:
                        entry["image"] = image_from_desc
                
                entries.append(entry)
                logger.info(f"Processed RDF item: {entry['title']}")
            except Exception as e:
                logger.error(f"Error processing RDF item: {str(e)}")
                import traceback
                logger.error(traceback.format_exc())
                continue
                
        return entries
        
    def process_atom_items(self, items):
        """Process Atom format entries"""
        entries = []
        
        for item in items:
            try:
                title_elem = item.find(f"{{{NAMESPACES['atom']}}}title") or item.find("title")
                title = title_elem.text if title_elem is not None else ""
                
                # Skip items without title
                if not title:
                    logger.warning("Skipping Atom entry without title")
                    continue
                
                # Atom uses summary or content for description
                summary_elem = item.find(f"{{{NAMESPACES['atom']}}}summary") or item.find("summary")
                content_elem = item.find(f"{{{NAMESPACES['atom']}}}content") or item.find("content")
                
                description = ""
                if summary_elem is not None:
                    description = summary_elem.text or ""
                elif content_elem is not None:
                    description = content_elem.text or ""
                
                # Atom uses link elements with attributes
                link = ""
                link_elem = item.find(f"{{{NAMESPACES['atom']}}}link") or item.find("link")
                if link_elem is not None:
                    link = link_elem.get("href", "")
                
                # Skip items without link
                if not link:
                    logger.warning(f"Skipping Atom entry without link: {title}")
                    continue
                
                # Atom uses updated or published elements for dates
                updated_elem = item.find(f"{{{NAMESPACES['atom']}}}updated") or item.find("updated")
                published_elem = item.find(f"{{{NAMESPACES['atom']}}}published") or item.find("published")
                
                pub_date = ""
                if published_elem is not None:
                    pub_date = published_elem.text or ""
                elif updated_elem is not None:
                    pub_date = updated_elem.text or ""
                
                # Atom uses author element with nested name
                author = ""
                author_elem = item.find(f"{{{NAMESPACES['atom']}}}author") or item.find("author")
                if author_elem is not None:
                    name_elem = author_elem.find(f"{{{NAMESPACES['atom']}}}name") or author_elem.find("name")
                    if name_elem is not None:
                        author = name_elem.text or ""
                
                # Atom may use category elements with term attribute
                category = ""
                category_elem = item.find(f"{{{NAMESPACES['atom']}}}category") or item.find("category")
                if category_elem is not None:
                    category = category_elem.get("term", "")
                
                # Create entry with standard fields
                entry = {
                    "title": title,
                    "description": description,
                    "external_link": link,
                    "publication_date": pub_date,
                    "image": None,  # Will be extracted from content if available
                    "newspaper_id": self.newspaper_id,
                    "author": author,
                    "category": category,
                    "is_processed": False
                }
                
                # Extract image from content if available
                if content_elem is not None and content_elem.text:
                    image_from_content = extract_image_from_description(content_elem.text)
                    if image_from_content:
                        entry["image"] = image_from_content
                
                entries.append(entry)
                logger.info(f"Processed Atom entry: {entry['title']}")
            except Exception as e:
                logger.error(f"Error processing Atom entry: {str(e)}")
                import traceback
                logger.error(traceback.format_exc())
                continue
                
        return entries

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
        
        # First, let's get the actual columns from the table to ensure we only include valid fields
        try:
            # Query table structure
            schema_endpoint = f"{self.supabase_url}/rest/v1/?table={self.supabase_table}"
            req = urllib.request.Request(schema_endpoint, headers=headers, method="GET")
            table_columns = []
            
            try:
                with urllib.request.urlopen(req) as response:
                    # This may or may not work depending on your Supabase version/configuration
                    schema_data = json.loads(response.read().decode())
                    if isinstance(schema_data, dict) and 'definitions' in schema_data:
                        # Extract column names if possible
                        properties = schema_data.get('definitions', {}).get(self.supabase_table, {}).get('properties', {})
                        table_columns = list(properties.keys())
                        logger.info(f"Retrieved table columns: {table_columns}")
            except Exception as e:
                logger.warning(f"Could not fetch table schema, will use default columns: {e}")
                # If schema fetch fails, use these common columns
                table_columns = ['title', 'description', 'external_link', 'publication_date', 
                                'image', 'newspaper_id', 'author', 'category', 'content', 'language']
                
            # Process each entry separately
            for entry in data[:10]:  # Limit to 10 entries for development/testing
                external_link = entry.get('external_link')
                if not external_link:
                    logger.warning(f"Entry missing external_link, skipping: {entry}")
                    continue
                    
                logger.info(f"Processing entry with link: {external_link}")
                
                # URL encode the external_link properly
                encoded_link = urllib.parse.quote_plus(external_link)
                query_url = f"{self.supabase_url}/rest/v1/{self.supabase_table}?external_link=eq.{encoded_link}"
                
                try:
                    # Check if the entry already exists
                    req = urllib.request.Request(query_url, headers=headers, method="GET")
                    with urllib.request.urlopen(req) as response:
                        existing_data = json.loads(response.read().decode())
                        if existing_data and len(existing_data) > 0:
                            logger.info(f"Skipping duplicate entry with link: {external_link}")
                            continue
                    
                    # Filter the entry to only include valid columns
                    filtered_entry = {}
                    
                    # First include the standard columns (defined above)
                    for key in table_columns:
                        if key in entry and entry[key]:  # Only include non-empty values
                            filtered_entry[key] = entry[key]
                    
                    # Allow a few essential columns that should be there
                    for key in ['title', 'description', 'external_link', 'publication_date', 'newspaper_id']:
                        if key in entry and entry[key] and key not in filtered_entry:
                            filtered_entry[key] = entry[key]
                    
                    # Extra check to ensure critical fields are present
                    if not filtered_entry.get('title') or not filtered_entry.get('external_link'):
                        logger.warning(f"Entry missing critical fields, skipping: {filtered_entry}")
                        continue
                    
                    # Add metadata
                    if 'is_processed' in table_columns:
                        filtered_entry['is_processed'] = False
                    if 'ai_processed' in table_columns:
                        filtered_entry['ai_processed'] = False
                        
                    req = urllib.request.Request(
                        supabase_endpoint, 
                        data=json.dumps(filtered_entry).encode(), 
                        headers=headers, 
                        method="POST"
                    )
                    with urllib.request.urlopen(req) as response:
                        logger.info(f"Insert response status: {response.status}")
                        if response.status == 201:
                            logger.info(f"Successfully inserted entry with link: {external_link}")
                            self.successful_entries_count += 1  # Increment counter for successful entries
                        else:
                            logger.warning(f"Unexpected status {response.status} when inserting: {external_link}")
                            
                except urllib.error.HTTPError as e:
                    error_body = e.read().decode() if hasattr(e, 'read') else 'No error body'
                    logger.error(f"HTTP Error {e.code} for {external_link}: {e.reason}. Body: {error_body}")
                    
                    # If it's a bad request due to invalid columns, we can try to analyze the error
                    if e.code == 400 and 'Could not find' in error_body and 'column' in error_body:
                        # Try to extract the problematic column
                        match = re.search(r"Could not find the '([^']+)' column", error_body)
                        if match:
                            bad_column = match.group(1)
                            logger.error(f"Removing invalid column '{bad_column}' from entry")
                            if bad_column in filtered_entry:
                                del filtered_entry[bad_column]
                                
                                # Try again with the fixed entry
                                try:
                                    req = urllib.request.Request(
                                        supabase_endpoint, 
                                        data=json.dumps(filtered_entry).encode(), 
                                        headers=headers, 
                                        method="POST"
                                    )
                                    with urllib.request.urlopen(req) as response:
                                        logger.info(f"Second attempt insert response status: {response.status}")
                                        if response.status == 201:
                                            logger.info(f"Successfully inserted entry with link: {external_link} (after fixing)")
                                            self.successful_entries_count += 1  # Increment counter for successful entries
                                except Exception as e2:
                                    logger.error(f"Error on second attempt: {str(e2)}")
                except Exception as e:
                    logger.error(f"Error processing entry {external_link}: {str(e)}")
        except Exception as e:
            logger.error(f"Error in upload_to_supabase: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())

    def update_newspaper_integration_date(self) -> bool:
        """Update the newspaper record with the current integration date"""
        if self.successful_entries_count == 0:
            logger.info("No entries were successfully processed, skipping newspaper update")
            return False
            
        logger.info(f"Updating integration_date for newspaper ID: {self.newspaper_id}")
        
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        
        # Construct the endpoint for updating the newspaper
        newspaper_endpoint = f"{self.supabase_url}/rest/v1/newspapers?id=eq.{self.newspaper_id}"
        
        # Data to update - set integration_date to current timestamp
        update_data = {
            "integration_date": datetime.utcnow().isoformat()
        }
        
        try:
            # Make the PATCH request to update the record
            req = urllib.request.Request(
                newspaper_endpoint,
                data=json.dumps(update_data).encode(),
                headers=headers,
                method="PATCH"
            )
            
            with urllib.request.urlopen(req) as response:
                status = response.status
                logger.info(f"Newspaper update response status: {status}")
                if status == 204:  # 204 No Content is the success response for PATCH
                    logger.info(f"Successfully updated integration_date for newspaper ID: {self.newspaper_id}")
                    return True
                else:
                    logger.warning(f"Unexpected status {status} when updating newspaper")
                    return False
                    
        except urllib.error.HTTPError as e:
            error_body = e.read().decode() if hasattr(e, 'read') else 'No error body'
            logger.error(f"HTTP Error {e.code} when updating newspaper: {e.reason}. Body: {error_body}")
            return False
        except Exception as e:
            logger.error(f"Error updating newspaper integration_date: {str(e)}")
            return False

    def process(self) -> None:
        """Main processing method to fetch RSS and upload to Supabase"""
        logger.info("Starting process() method")
        try:
            rss_feed_url = self.get_rss_feed_url()
            if not rss_feed_url:
                logger.error("Unable to get RSS feed URL, aborting process")
                return
                
            logger.info(f"Got RSS feed URL: {rss_feed_url}, fetching data...")
            entries = self.fetch_rss_data(rss_feed_url)

            if entries:
                logger.info(f"Fetched {len(entries)} entries, uploading to Supabase...")
                self.upload_to_supabase(entries)
                logger.info(f"Successfully processed {self.successful_entries_count} out of {len(entries)} entries")
                
                # If at least one entry was successfully processed, update the newspaper record
                if self.successful_entries_count > 0:
                    logger.info("Updating newspaper integration_date...")
                    self.update_newspaper_integration_date()
            else:
                logger.warning("No entries were successfully processed")
        except Exception as e:
            logger.error(f"Error in main processing flow: {str(e)}")
            # Print the full stack trace for debugging
            import traceback
            logger.error(traceback.format_exc())
            raise

def lambda_handler(event, context):
    """AWS Lambda handler function"""
    logger.info(f"Lambda function started with event: {json.dumps(event)}")
    
    try:
        newspaper_id = event.get('newspaper_id')
        supabase_url = os.environ.get('SUPABASE_URL')
        supabase_key = os.environ.get('SUPABASE_KEY')
        supabase_table = os.environ.get('SUPABASE_TABLE_EVENTS_RAW')

        logger.info(f"Newspaper ID: {newspaper_id}")
        logger.info(f"Supabase URL configured: {'Yes' if supabase_url else 'No'}")
        logger.info(f"Supabase Key configured: {'Yes' if supabase_key else 'No'}")
        logger.info(f"Supabase Table: {supabase_table}")

        if not all([newspaper_id, supabase_url, supabase_key, supabase_table]):
            missing = [k for k, v in {
                'newspaper_id': newspaper_id,
                'supabase_url': supabase_url,
                'supabase_key': supabase_key,
                'supabase_table': supabase_table,
            }.items() if not v]
            error_msg = f'Missing required parameters: {", ".join(missing)}'
            logger.error(error_msg)
            return {'statusCode': 400, 'body': json.dumps({'status': 'error', 'message': error_msg})}
        
        processor = RSSProcessor(newspaper_id, supabase_url, supabase_key, supabase_table)
        logger.info("RSSProcessor initialized, starting processing")
        processor.process()
        
        logger.info("Processing completed successfully")
        return {'statusCode': 200, 'body': json.dumps({
            'status': 'success', 
            'message': 'RSS feed processed successfully',
            'entries_processed': processor.successful_entries_count
        })}
    except Exception as e:
        logger.error(f"Lambda execution error: {str(e)}")
        # Print the full stack trace for debugging
        import traceback
        logger.error(traceback.format_exc())
        return {'statusCode': 500, 'body': json.dumps({'status': 'error', 'message': str(e)})}
    finally:
        logger.info("Lambda function execution completed")