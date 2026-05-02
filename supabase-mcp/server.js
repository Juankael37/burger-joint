const { Server } = require('@modelcontextprotocol/sdk/server');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio');
const { CallToolSchema, ListToolsSchema } = require('@modelcontextprotocol/sdk/types');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://epbzzntbppyyxeisuvtr.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYnp6bnRicHB5eXhlaXN1dnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjY2MzIsImV4cCI6MjA5MzI0MjYzMn0.w8GcCOAOIhi7Yx7Rhc8i8qszemDI6i0An9qSlTUye2Y';

const supabase = createClient(supabaseUrl, supabaseKey);

const server = new Server(
  {
    name: 'supabase-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsSchema, async () => {
  return {
    tools: [
      {
        name: 'supabase_query',
        description: 'Run a SQL query on Supabase database',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'SQL query to execute'
            },
            operation: {
              type: 'string',
              enum: ['select', 'insert', 'update', 'delete'],
              description: 'Type of operation'
            }
          },
          required: ['query', 'operation']
        }
      },
      {
        name: 'supabase_list_tables',
        description: 'List all tables in the database',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'storage_upload',
        description: 'Upload a file to Supabase Storage',
        inputSchema: {
          type: 'object',
          properties: {
            bucket: {
              type: 'string',
              description: 'Storage bucket name'
            },
            path: {
              type: 'string',
              description: 'Path to save the file'
            },
            content: {
              type: 'string',
              description: 'Base64 encoded file content'
            },
            contentType: {
              type: 'string',
              description: 'MIME type of the file'
            }
          },
          required: ['bucket', 'path', 'content']
        }
      },
      {
        name: 'storage_list_files',
        description: 'List files in a storage bucket',
        inputSchema: {
          type: 'object',
          properties: {
            bucket: {
              type: 'string',
              description: 'Storage bucket name'
            },
            folder: {
              type: 'string',
              description: 'Folder path to list'
            }
          },
          required: ['bucket']
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolSchema, async (request) => {
  const { name, arguments: args } = request;

  try {
    switch (name) {
      case 'supabase_query': {
        const { query, operation } = args;
        
        if (operation === 'select') {
          const { data, error } = await supabase.from(query.from || 'menu_items').select(query.select || '*');
          if (error) throw error;
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
        
        if (operation === 'insert') {
          const { data, error } = await supabase.from(args.table || 'menu_items').insert(args.data);
          if (error) throw error;
          return { content: [{ type: 'text', text: 'Insert successful: ' + JSON.stringify(data) }] };
        }
        
        if (operation === 'update') {
          const { data, error } = await supabase.from(args.table || 'menu_items').update(args.data).eq('id', args.id);
          if (error) throw error;
          return { content: [{ type: 'text', text: 'Update successful' }] };
        }
        
        if (operation === 'delete') {
          const { error } = await supabase.from(args.table || 'menu_items').delete().eq('id', args.id);
          if (error) throw error;
          return { content: [{ type: 'text', text: 'Delete successful' }] };
        }
        
        return { content: [{ type: 'text', text: 'Query executed' }] };
      }

      case 'supabase_list_tables': {
        const { data, error } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public');
        if (error) throw error;
        return { content: [{ type: 'text', text: 'Tables: ' + JSON.stringify(data, null, 2) }] };
      }

      case 'storage_upload': {
        const { bucket, path, content, contentType } = args;
        const buffer = Buffer.from(content, 'base64');
        const { data, error } = await supabase.storage.from(bucket).upload(path, buffer, { contentType });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
        return { content: [{ type: 'text', text: 'Uploaded: ' + urlData.publicUrl }] };
      }

      case 'storage_list_files': {
        const { bucket, folder } = args;
        const { data, error } = await supabase.storage.from(bucket).list(folder || '');
        if (error) throw error;
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return { content: [{ type: 'text', text: 'Error: ' + error.message }], isError: true };
  }
});

const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);