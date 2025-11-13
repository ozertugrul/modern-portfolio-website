import re

with open('main.rs', 'r') as f:
    content = f.read()

# Replace row.get("field") with row.try_get("field").unwrap()
# But only for actual field access, not methods
content = re.sub(
    r'row\.get\("([^"]+)"\)',
    r'row.try_get("\1").unwrap()',
    content
)

# Fix the technologies special case (.0 after get)
content = re.sub(
    r'row\.try_get\("technologies"\)\.unwrap\(\)\.0',
    r'row.try_get::<sqlx::types::Json<Vec<String>>, _>("technologies").unwrap().0',
    content
)

with open('main.rs', 'w') as f:
    f.write(content)

print("✅ Fixed row.get() calls")
