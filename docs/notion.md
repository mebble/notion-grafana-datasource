# Notion

- [API Reference](https://developers.notion.com/reference/intro)
- [jq usage](https://programminghistorian.org/en/lessons/json-and-jq)

## Notion API curls

Get information on a database:

```bash
curl -X GET "https://api.notion.com/v1/databases/${NOTION_DB_ID}" \
    -H "Authorization: Bearer ${NOTION_KEY}" \
    -H 'Content-Type: application/json' \
    -H 'Notion-Version: 2021-05-13' | jq
```

Get a paginated response of three records of all expenses, sorted by Date:

```bash
curl -X POST "https://api.notion.com/v1/databases/${NOTION_DB_ID}/query" \
    -H "Authorization: Bearer ${NOTION_KEY}" \
    -H 'Content-Type: application/json' \
    -H 'Notion-Version: 2021-05-13' \
    --data '{
        "sorts": [{
            "property": "Date",
            "direction": "descending"
        }],
        "page_size": 3
    }' | jq
```

Get expenses between two absolute dates, sorted by Date:

```bash
curl -X POST "https://api.notion.com/v1/databases/${NOTION_DB_ID}/query" \
    -H "Authorization: Bearer ${NOTION_KEY}" \
    -H 'Content-Type: application/json' \
    -H 'Notion-Version: 2021-05-13' \
    --data '{
        "filter": {
            "and": [
                {
                    "property": "Date",
                    "date": {
                        "on_or_after": "2021-05-10"
                    }
                },
                {
                    "property": "Date",
                    "date": {
                        "on_or_before": "2021-07-10"
                    }
                }
            ]
        },
        "sorts": [{
            "property": "Date",
            "direction": "descending"
        }]
    }' | jq ' [
        .results[] | {
            created_at:  .created_time,
            date:        .properties.Date.date.start,
            name:        .properties.Name.title[0] | .text.content,
            amount:      .properties.Amount.number,
            categories: [.properties.Category.multi_select[] | .name]
        }
    ]'
```

