-- Migration: Add 'rating' column to service_providers table
ALTER TABLE service_providers
ADD COLUMN rating DECIMAL(3,2) DEFAULT NULL;
