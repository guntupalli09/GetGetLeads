-- Create function to ensure user settings exist
CREATE OR REPLACE FUNCTION ensure_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_settings (user_id, theme, email_notifications)
    VALUES (NEW.id, 'dark', true)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_user_settings_exists ON auth.users;

-- Create new trigger
CREATE TRIGGER ensure_user_settings_exists
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION ensure_user_settings();

-- Insert settings for existing users
INSERT INTO user_settings (user_id, theme, email_notifications)
SELECT id, 'dark', true
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM user_settings WHERE user_settings.user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING;