CREATE TABLE news_articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT NOT NULL,
    author TEXT,
    newspaper_id INT NOT NULL,
    theme TEXT NOT NULL,
    theme_tags TEXT[],
    image TEXT,
    external_link TEXT NOT NULL,
    publication_date TIMESTAMP WITH TIME ZONE NOT NULL,
    country_id CHAR(2) NOT NULL;
    location TEXT,
    language TEXT NOT NULL,
     minimal_age INT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);



ALTER TABLE news_articles
ADD CONSTRAINT fk_newspaper_id FOREIGN KEY (newspaper_id)
REFERENCES newspapers(id);

ALTER TABLE news_articles
ADD CONSTRAINT fk_country_id FOREIGN KEY (country_id)
REFERENCES countries(id);

CREATE TABLE news_articles_raw (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    newspaper_id INT NOT NULL,
    image TEXT,
    external_link TEXT NOT NULL UNIQUE,
    publication_date TIMESTAMP WITH TIME ZONE NOT NULL,
    ai_processed BOOLEAN DEFAULT FALSE,
    ai_processed_date TIMESTAMP WITH TIME ZONE
);

CREATE TABLE news_articles_translated (
    id SERIAL PRIMARY KEY,
    original_article_id INT NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT NOT NULL,
    location TEXT,
    language_translated CHAR(2) NOT NULL,
    UNIQUE (original_article_id, language_translated)
);

CREATE TABLE theme_tags (
    id SERIAL PRIMARY KEY,
    article_id INT NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (article_id) REFERENCES news_articles(id) ON DELETE CASCADE
);

CREATE INDEX idx_news_articles_date ON news_articles(publication_date);
CREATE INDEX idx_theme_tags_article_id ON theme_tags(article_id);


CREATE TABLE newspapers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country_id CHAR(2) NOT NULL,
    image_url TEXT,
    description TEXT NOT NULL,
    rss_feed_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    image_url TEXT,
    capital VARCHAR(100),
    number_of_inhabitants BIGINT,
    superficie BIGINT,
    president VARCHAR(100),
    type_de_gouvernement VARCHAR(100),
    religions TEXT[]
);

-- Insert data into Newspapers table
INSERT INTO Newspapers (name, country_id, description, rss_feed_url) VALUES
('The New York Times', 'US', 'Founded in 1851, it rose to prominence through its coverage of political corruption and became known for its comprehensive reporting and influence as a national "newspaper of record." It has a broad international reach and is considered one of the most influential newspapers globally.', 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml'),
('The Guardian', 'UK', 'Established in 1821 in Manchester as the Manchester Guardian, it later moved to London and adopted its current name. Historically associated with liberal political views, it has a reputation for in-depth reporting, investigative journalism, and a significant online presence with a global readership.', 'https://www.theguardian.com/world/rss'),
('The Wall Street Journal', 'US', 'Founded in 1889, it focuses on business and financial news. Over time, it expanded its coverage to include global news and politics. It is known for its in-depth financial reporting and conservative editorial stance.', 'https://www.wsj.com/xml/rss/3_7085.xml'),
('BBC News', 'UK', 'Originating as a radio news service in 1922, BBC News expanded into television and online platforms, becoming a globally recognized news organization. While not a traditional newspaper, its extensive international reporting and reach make it a significant news source.', 'http://feeds.bbci.co.uk/news/world/rss.xml'),
('Reuters', 'GB', 'Founded in London in 1851, Reuters is a major international news agency providing news to media organizations worldwide. While primarily a news wire service, its reporting shapes the international news landscape.', NULL),
('Associated Press (AP)', 'US', 'Established in 1846, AP is a global news agency headquartered in New York. It operates as a cooperative, providing news, photos, and videos to numerous newspapers and broadcasters internationally.', 'https://rss.app/feeds/x5C5o5N2qY6nJ8kQ'),
('CNN', 'US', 'Founded in 1980 as the first 24-hour cable news channel, CNN has grown into a major global news network with a significant online presence. It provides continuous coverage of international events.', 'http://rss.cnn.com/rss/edition_world.rss'),
('Al Jazeera', 'QA', 'Launched in 1996 in Qatar, Al Jazeera is a major international news network, particularly prominent in the Middle East. It provides a global perspective on news and events, often focusing on regions underrepresented in Western media.', 'https://www.aljazeera.com/xml/rss/all.xml'),
('Le Monde', 'FR', 'Founded in 1944 in France, Le Monde is a leading French daily newspaper known for its in-depth analysis of political and international affairs. It is considered a newspaper of record in France with a significant international readership.', 'https://www.lemonde.fr/rss/une.xml'),
('El País', 'ES', 'Established in 1976 in Spain, El País is a major Spanish-language daily newspaper with a strong focus on national and international news. It has a wide readership in Spain and Latin America.', 'https://elpais.com/rss/internacional/portada.xml');

INSERT INTO countries (country_id, name, flag_image_url, capital, number_of_inhabitants, superficie, president, type_de_gouvernement, religions) VALUES
('FR', 'France', 'https://flagcdn.com/fr.svg', 'Paris', 68000000, 551695, 'Emmanuel Macron', 'République', ARRAY['Catholicisme', 'Islam', 'Protestantisme']),
('DE', 'Germany', 'https://flagcdn.com/de.svg', 'Berlin', 83166711, 357022, 'Frank-Walter Steinmeier', 'République fédérale', ARRAY['Christianisme', 'Islam', 'Athéisme']),
('US', 'United States', 'https://flagcdn.com/us.svg', 'Washington, D.C.', 331893745, 9833517, 'Joe Biden', 'République fédérale', ARRAY['Christianisme', 'Athéisme', 'Islam']),
('CN', 'China', 'https://flagcdn.com/cn.svg', 'Beijing', 1412600000, 9596961, 'Xi Jinping', 'Communisme', ARRAY['Bouddhisme', 'Taoïsme', 'Islam']),
('JP', 'Japan', 'https://flagcdn.com/jp.svg', 'Tokyo', 125800000, 377975, 'Fumio Kishida', 'Monarchie constitutionnelle', ARRAY['Shintoïsme', 'Bouddhisme']),
('BR', 'Brazil', 'https://flagcdn.com/br.svg', 'Brasilia', 214000000, 8515767, 'Luiz Inácio Lula da Silva', 'République fédérale', ARRAY['Christianisme', 'Spiritisme']),
('IN', 'India', 'https://flagcdn.com/in.svg', 'New Delhi', 1393409038, 3287263, 'Droupadi Murmu', 'République', ARRAY['Hindouisme', 'Islam', 'Christianisme']),
('GB', 'United Kingdom', 'https://flagcdn.com/gb.svg', 'London', 67886004, 243610, 'Charles III', 'Monarchie constitutionnelle', ARRAY['Christianisme', 'Islam', 'Athéisme']),
('RU', 'Russia', 'https://flagcdn.com/ru.svg', 'Moscow', 143449286, 17098242, 'Vladimir Poutine', 'République fédérale', ARRAY['Christianisme orthodoxe', 'Islam']),
('MX', 'Mexico', 'https://flagcdn.com/mx.svg', 'Mexico City', 126014024, 1964375, 'Andrés Manuel López Obrador', 'République fédérale', ARRAY['Catholicisme', 'Christianisme évangélique']),
('IT', 'Italy', 'https://flagcdn.com/it.svg', 'Rome', 60244639, 301340, 'Sergio Mattarella', 'République', ARRAY['Catholicisme', 'Athéisme']),
('CA', 'Canada', 'https://flagcdn.com/ca.svg', 'Ottawa', 38005238, 9984670, 'Mary Simon', 'Monarchie constitutionnelle', ARRAY['Christianisme', 'Islam', 'Hindouisme']),
('AU', 'Australia', 'https://flagcdn.com/au.svg', 'Canberra', 25766605, 7692024, 'David Hurley', 'Monarchie constitutionnelle', ARRAY['Christianisme', 'Athéisme']),
('ES', 'Spain', 'https://flagcdn.com/es.svg', 'Madrid', 47329981, 505992, 'Felipe VI', 'Monarchie constitutionnelle', ARRAY['Catholicisme', 'Athéisme']),
('ZA', 'South Africa', 'https://flagcdn.com/za.svg', 'Pretoria', 59308690, 1219090, 'Cyril Ramaphosa', 'République', ARRAY['Christianisme', 'Islam']),
('AR', 'Argentina', 'https://flagcdn.com/ar.svg', 'Buenos Aires', 45195774, 2780400, 'Javier Milei', 'République', ARRAY['Christianisme', 'Athéisme']),
('EG', 'Egypt', 'https://flagcdn.com/eg.svg', 'Cairo', 104258327, 1002450, 'Abdel Fattah al-Sissi', 'République', ARRAY['Islam', 'Christianisme copte']),
('KR', 'South Korea', 'https://flagcdn.com/kr.svg', 'Seoul', 51635256, 100210, 'Yoon Suk-yeol', 'République', ARRAY['Bouddhisme', 'Christianisme', 'Athéisme']),
('TR', 'Turkey', 'https://flagcdn.com/tr.svg', 'Ankara', 84339067, 783562, 'Recep Tayyip Erdoğan', 'République', ARRAY['Islam']),
('ID', 'Indonesia', 'https://flagcdn.com/id.svg', 'Jakarta', 273523621, 1904569, 'Joko Widodo', 'République', ARRAY['Islam', 'Christianisme', 'Hindouisme']),
('SA', 'Saudi Arabia', 'https://flagcdn.com/sa.svg', 'Riyadh', 34813867, 2149690, 'Salman ben Abdelaziz Al Saoud', 'Monarchie absolue', ARRAY['Islam']),
('SE', 'Sweden', 'https://flagcdn.com/se.svg', 'Stockholm', 10353442, 450295, 'Carl XVI Gustaf', 'Monarchie constitutionnelle', ARRAY['Christianisme', 'Athéisme']),
('CH', 'Switzerland', 'https://flagcdn.com/ch.svg', 'Bern', 8636896, 41284, 'Viola Amherd', 'République fédérale', ARRAY['Christianisme', 'Athéisme']),
('PL', 'Poland', 'https://flagcdn.com/pl.svg', 'Warsaw', 37779560, 312696, 'Andrzej Duda', 'République', ARRAY['Catholicisme', 'Athéisme']),
('UA', 'Ukraine', 'https://flagcdn.com/ua.svg', 'Kyiv', 43733762, 603500, 'Volodymyr Zelensky', 'République', ARRAY['Christianisme orthodoxe', 'Athéisme']),
('NO', 'Norway', 'https://flagcdn.com/no.svg', 'Oslo', 5421241, 385207, 'Harald V', 'Monarchie constitutionnelle', ARRAY['Christianisme', 'Athéisme']),
('NL', 'Netherlands', 'https://flagcdn.com/nl.svg', 'Amsterdam', 17441139, 41543, 'Willem-Alexander', 'Monarchie constitutionnelle', ARRAY['Christianisme', 'Athéisme']),
('PT', 'Portugal', 'https://flagcdn.com/pt.svg', 'Lisbon', 10196709, 92090, 'Marcelo Rebelo de Sousa', 'République', ARRAY['Catholicisme']),
('BE', 'Belgium', 'https://flagcdn.com/be.svg', 'Brussels', 11589623, 30528, 'Philippe', 'Monarchie constitutionnelle', ARRAY['Catholicisme', 'Athéisme']),
('AT', 'Austria', 'https://flagcdn.com/at.svg', 'Vienna', 8902600, 83879, 'Alexander Van der Bellen', 'République', ARRAY['Christianisme', 'Athéisme']),
('FI', 'Finland', 'https://flagcdn.com/fi.svg', 'Helsinki', 5540720, 338424, 'Alexander Stubb', 'République', ARRAY['Christianisme', 'Athéisme']),
('DK', 'Denmark', 'https://flagcdn.com/dk.svg', 'Copenhagen', 5831404, 42925, 'Frederik X', 'Monarchie constitutionnelle', ARRAY['Christianisme']),
('GR', 'Greece', 'https://flagcdn.com/gr.svg', 'Athens', 10423054, 131957, 'Katerina Sakellaropoulou', 'République', ARRAY['Christianisme orthodoxe']),
('IE', 'Ireland', 'https://flagcdn.com/ie.svg', 'Dublin', 4994724, 70273, 'Michael D. Higgins', 'République', ARRAY['Catholicisme']),
('NZ', 'New Zealand', 'https://flagcdn.com/nz.svg', 'Wellington', 5084300, 268838, 'Cindy Kiro', 'Monarchie constitutionnelle', ARRAY['Christianisme', 'Athéisme']),
('IL', 'Israel', 'https://flagcdn.com/il.svg', 'Jerusalem', 9216900, 20770, 'Isaac Herzog', 'République', ARRAY['Judaïsme', 'Islam', 'Christianisme']),
('PK', 'Pakistan', 'https://flagcdn.com/pk.svg', 'Islamabad', 225199937, 881913, 'Arif Alvi', 'République islamique', ARRAY['Islam']);
