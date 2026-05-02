# Supabase MCP Server

MCP server for direct Supabase database access - no manual SQL needed!

## Setup

```bash
cd supabase-mcp
npm install
```

## Run

```bash
npm start
```

## Configure in your IDE/Client

Add to your MCP configuration (Cursor, Claude Desktop, etc.):

```json
{
  "mcpServers": {
    "supabase": {
      "command": "node",
      "args": ["/path/to/supabase-mcp/server.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_ANON_KEY": "your-anon-key"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `supabase_query` | Run SQL queries (select, insert, update, delete) |
| `supabase_list_tables` | List all database tables |
| `storage_upload` | Upload files to Supabase Storage |
| `storage_list_files` | List files in a storage bucket |

## Usage Examples

- Query data: `SELECT * FROM menu_items`
- Insert: `INSERT INTO table VALUES (...)`
- Upload: Upload images to storage buckets