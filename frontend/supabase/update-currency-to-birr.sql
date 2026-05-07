-- Update currency from USD to ETB (Ethiopian Birr)
UPDATE settings 
SET value = jsonb_set(value, '{currency}', '"ETB"')
WHERE key = 'payment_settings';

-- Verify the change
SELECT value->>'currency' as currency FROM settings WHERE key = 'payment_settings';
