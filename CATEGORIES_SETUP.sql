-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, name)
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
    ('Legal', 'Legal documents and contracts'),
    ('Business', 'Business plans and proposals'),
    ('Personal', 'Personal documents'),
    ('Drafts', 'Work in progress documents'),
    ('Technical', 'Technical documentation'),
    ('Financial', 'Financial reports and statements')
ON CONFLICT (name) DO NOTHING;

-- Insert some default subcategories (you can customize these)
INSERT INTO subcategories (category_id, name, description)
SELECT 
    c.id,
    sub.name,
    sub.description
FROM categories c
CROSS JOIN (
    VALUES 
        ('Contracts', 'Legal contracts'),
        ('Agreements', 'Legal agreements'),
        ('Policies', 'Company policies')
) AS sub(name, description)
WHERE c.name = 'Legal'
ON CONFLICT (category_id, name) DO NOTHING;

INSERT INTO subcategories (category_id, name, description)
SELECT 
    c.id,
    sub.name,
    sub.description
FROM categories c
CROSS JOIN (
    VALUES 
        ('Proposals', 'Business proposals'),
        ('Reports', 'Business reports'),
        ('Presentations', 'Business presentations'),
        ('Plans', 'Business plans')
) AS sub(name, description)
WHERE c.name = 'Business'
ON CONFLICT (category_id, name) DO NOTHING;

INSERT INTO subcategories (category_id, name, description)
SELECT 
    c.id,
    sub.name,
    sub.description
FROM categories c
CROSS JOIN (
    VALUES 
        ('Letters', 'Personal letters'),
        ('Notes', 'Personal notes'),
        ('Documents', 'Personal documents')
) AS sub(name, description)
WHERE c.name = 'Personal'
ON CONFLICT (category_id, name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all authenticated users to read categories)
CREATE POLICY "Allow authenticated users to read categories" 
    ON categories FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated users to read subcategories" 
    ON subcategories FOR SELECT 
    TO authenticated 
    USING (true);

-- Optional: Allow admins to manage categories (replace with your admin role)
CREATE POLICY "Allow admins to manage categories" 
    ON categories FOR ALL 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow admins to manage subcategories" 
    ON subcategories FOR ALL 
    TO authenticated 
    USING (true);
