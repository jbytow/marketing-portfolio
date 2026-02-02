-- Add stats items as JSON to site_settings
ALTER TABLE site_settings ADD COLUMN stats_items JSONB DEFAULT '[
    {"icon": "target", "value": "50+", "labelEn": "Campaigns", "labelPl": "Kampanii"},
    {"icon": "users", "value": "100+", "labelEn": "Happy Clients", "labelPl": "Zadowolonych klientów"},
    {"icon": "trending-up", "value": "10M+", "labelEn": "Audience Reach", "labelPl": "Zasięg"},
    {"icon": "sparkles", "value": "5+", "labelEn": "Years Experience", "labelPl": "Lat doświadczenia"}
]'::jsonb;
