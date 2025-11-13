import re

# Read file
with open('main.rs', 'r') as f:
    content = f.read()

# Replace row.field_name with row.get("field_name")
# Match patterns like: row.something
pattern = r'row\.([a-z_][a-z0-9_]*)'

def replace_func(match):
    field = match.group(1)
    # Don't replace method calls or common methods
    if field in ['get', 'try_get', 'map', 'unwrap', 'ok', 'flatten', 'iter', 'into_iter']:
        return match.group(0)
    return f'row.get("{field}")'

content = re.sub(pattern, replace_func, content)

# Write back
with open('main.rs', 'w') as f:
    f.write(content)

print("✅ Row field access converted to get() calls")
