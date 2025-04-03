import os
import json
import urllib.request
import urllib.parse

def supabase_request(endpoint, method="GET", data=None):
    url = f"{os.getenv('SUPABASE_URL')}/rest/v1/{endpoint}"
    headers = {
        "apikey": os.getenv("SUPABASE_API_KEY"),
        "Authorization": f"Bearer {os.getenv('SUPABASE_API_KEY')}",
        "Content-Type": "application/json"
    }
    
    req_data = None
    if data:
        req_data = json.dumps(data).encode("utf-8")
    
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as e:
        print("Supabase API Error:", e)
        return None

def translate_text(text, source_lang, target_lang):
    if not text or source_lang.upper() == target_lang.upper():
        return text  # No translation needed
    
    api_key = os.getenv("DEEPL_API_KEY")
    if not api_key:
        print("Error: DeepL API key is missing!")
        return text  # Avoid calling API with missing key
    
    url = "https://api.deepl.com/v2/translate"  # Change if using paid API
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    data = urllib.parse.urlencode({
        'auth_key': api_key,
        'text': text,
        'target_lang': target_lang.upper()
        # Removed source_lang to allow auto-detection
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))
            print("DeepL Response:", result)  # Debugging
            return result["translations"][0]["text"]
    except Exception as e:
        print("DeepL Error:", e)
        return text  # Return original if error occurs

def lambda_handler(event, context):
    # Get articles that have not been translated
    articles = supabase_request("news_articles?translated=eq.false", "GET")
    if not articles:
        return {"statusCode": 200, "body": json.dumps("No articles to translate.")}
    
    for article in articles:
        original_id = article["id"]
        source_lang = article["language"].upper()
        
        for target_lang in ["EN", "FR", "HI", "ES", "ZH"]:
            print(f"Original Subtitle: {article['subtitle']}")
            print(f"Original Description: {article['description']}")

            translated_title = translate_text(article["title"], source_lang, target_lang)
            translated_subtitle = translate_text(article["subtitle"], source_lang, target_lang) if article["subtitle"] else None
            translated_description = translate_text(article["description"], source_lang, target_lang)
            translated_location = translate_text(article["location"], source_lang, target_lang)
                
            translation_data = {
                "original_article_id": original_id,
                "title": translated_title,
                "subtitle": translated_subtitle,
                "description": translated_description,
                "location": translated_location,
                "language_translated": target_lang
            }
            print(f"Translation data: {translation_data}")
            supabase_request("news_articles_translated", "POST", translation_data)
        
        # Mark article as translated and set translated_date
        update_data = {"translated": True, "translated_date": "now()"}
        supabase_request(f"news_articles?id=eq.{original_id}", "PATCH", update_data)
    
    return {"statusCode": 200, "body": json.dumps("Translation process completed successfully.")}
