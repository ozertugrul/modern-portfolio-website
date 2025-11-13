import re

with open('main.rs', 'r') as f:
    lines = f.readlines()

result = []
i = 0
while i < len(lines):
    line = lines[i]
    
    # Check if this is a sqlx::query( line
    if 'sqlx::query(' in line and 'sqlx::query_as' not in line:
        # Collect the full query call
        query_lines = [line]
        bracket_count = line.count('(') - line.count(')')
        i += 1
        
        # Find where query ends (before .execute or .fetch)
        while i < len(lines) and not ('.execute(' in lines[i] or '.fetch' in lines[i]):
            query_lines.append(lines[i])
            bracket_count += lines[i].count('(') - lines[i].count(')')
            i += 1
            
        # Parse the query
        full_query = ''.join(query_lines)
        
        # Extract SQL string and parameters
        # Pattern: sqlx::query( "SQL" , param1, param2, ... )
        match = re.search(r'sqlx::query\(\s*(r#".*?"#|".*?")\s*,\s*(.+?)\s*\)\s*$', full_query, re.DOTALL)
        
        if match:
            sql_str = match.group(1)
            params_str = match.group(2).strip()
            
            # Split parameters
            params = [p.strip() for p in re.split(r',(?![^<>]*>)', params_str) if p.strip()]
            
            # Build new format
            new_query = f'    sqlx::query({sql_str})\n'
            for param in params:
                new_query += f'        .bind({param})\n'
            new_query += '    )\n'
            
            result.append(new_query)
        else:
            # No parameters, keep as is
            result.extend(query_lines)
            
        continue
    
    result.append(line)
    i += 1

with open('main.rs', 'w') as f:
    f.writelines(result)

print("✅ Converted query() calls to use .bind()")
