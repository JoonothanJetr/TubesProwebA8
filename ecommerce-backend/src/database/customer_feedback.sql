CREATE TABLE IF NOT EXISTS customer_feedback (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_feedback_email ON customer_feedback(email);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON customer_feedback(status);

-- Create function to update timestamp on record updates
CREATE OR REPLACE FUNCTION update_feedback_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update timestamp
DROP TRIGGER IF EXISTS update_feedback_timestamp ON customer_feedback;
CREATE TRIGGER update_feedback_timestamp
BEFORE UPDATE ON customer_feedback
FOR EACH ROW EXECUTE FUNCTION update_feedback_timestamp();