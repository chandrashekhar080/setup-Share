-- Create events table for Share2care
USE sharetocare;

CREATE TABLE IF NOT EXISTS events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    location VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    max_participants INT DEFAULT 50,
    current_participants INT DEFAULT 0,
    organizer_id BIGINT UNSIGNED NOT NULL,
    status ENUM('active', 'inactive', 'completed', 'cancelled') DEFAULT 'active',
    image_url VARCHAR(255) NULL,
    requirements JSON NULL,
    contact_info TEXT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    registration_deadline DATETIME NULL,
    event_type ENUM('charity', 'volunteer', 'fundraising', 'awareness', 'community') DEFAULT 'charity',
    tags JSON NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    
    INDEX idx_status_date (status, event_date),
    INDEX idx_category (category_id),
    INDEX idx_organizer (organizer_id),
    INDEX idx_featured (is_featured),
    INDEX idx_event_type (event_type)
);

-- Add foreign key constraints if they don't exist
-- Note: We'll add these manually if needed since the referenced tables might not have the exact structure

-- Insert some sample data for testing
INSERT INTO events (title, description, category_id, location, event_date, start_time, end_time, max_participants, organizer_id, status, event_type, is_featured, created_at, updated_at) VALUES
('Community Food Drive', 'Help collect food donations for local families in need. Join us in making a difference in our community.', 1, 'Community Center, Main Street', '2024-02-15', '2024-02-15 09:00:00', '2024-02-15 17:00:00', 50, 1, 'active', 'charity', true, NOW(), NOW()),
('Beach Cleanup Volunteer Day', 'Join our environmental initiative to clean up the local beach and protect marine life.', 1, 'Sunset Beach, Coastal Road', '2024-02-20', '2024-02-20 08:00:00', '2024-02-20 12:00:00', 30, 1, 'active', 'volunteer', false, NOW(), NOW()),
('Charity Fundraising Gala', 'An elegant evening to raise funds for children\'s education programs in underserved communities.', 1, 'Grand Hotel Ballroom', '2024-03-01', '2024-03-01 18:00:00', '2024-03-01 23:00:00', 200, 1, 'active', 'fundraising', true, NOW(), NOW());