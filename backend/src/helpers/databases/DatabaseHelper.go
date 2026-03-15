package databases

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"goscraper/src/globals"
	"io"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/supabase-community/supabase-go"
)

type DatabaseHelper struct {
	client *supabase.Client
	key    []byte
}

func NewDatabaseHelper() (*DatabaseHelper, error) {
	if globals.DevMode {
		godotenv.Load()
	}
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	encryptionKey := os.Getenv("ENCRYPTION_KEY")

	client, err := supabase.NewClient(supabaseUrl, supabaseKey, nil)
	if err != nil {
		return nil, err
	}
	hash := sha256.Sum256([]byte(encryptionKey))
	return &DatabaseHelper{
		client: client,
		key:    hash[:],
	}, nil
}

func (db *DatabaseHelper) encrypt(text string) (string, error) {
	block, err := aes.NewCipher(db.key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(text), nil)
	encrypted := base64.StdEncoding.EncodeToString(ciphertext)
	return encrypted, nil
}

func (db *DatabaseHelper) decrypt(encryptedText string) (string, error) {
	ciphertext, err := base64.StdEncoding.DecodeString(encryptedText)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(db.key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", err
	}

	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

func (db *DatabaseHelper) UpsertData(table string, data map[string]interface{}) error {
	regNumber, hasRegNumber := data["regNumber"]
	token, hasToken := data["token"]

	data["lastUpdated"] = time.Now().UnixNano() / int64(time.Millisecond)

	for key, value := range data {
		if key != "regNumber" && key != "token" && key != "lastUpdated" && key != "timetable" && key != "ophour" {
			jsonBytes, err := json.Marshal(value)
			if err != nil {
				return err
			}
			encrypted, err := db.encrypt(string(jsonBytes))
			if err != nil {
				return err
			}
			data[key] = encrypted
		}

	}

	if hasRegNumber {
		data["regNumber"] = regNumber
	}
	if hasToken {
		data["token"] = token
	}

	_, _, err := db.client.From(table).Upsert(data, "regNumber", "", "").Execute()
	return err
}

func (db *DatabaseHelper) ReadData(table string, query map[string]interface{}) ([]map[string]interface{}, error) {
	var results []map[string]interface{}

	queryAsString := make(map[string]string)
	for k, v := range query {
		if str, ok := v.(string); ok {
			queryAsString[k] = str
		}
	}

	_, _, err := db.client.From(table).Select("*", "", false).Match(queryAsString).Execute()
	if err != nil {
		return nil, err
	}

	for _, row := range results {
		for key, value := range row {
			if str, ok := value.(string); ok {
				if key != "regNumber" && key != "token" && key != "lastUpdated" && key != "timetable" && key != "ophour" {
					decrypted, err := db.decrypt(str)
					if err != nil {
						return nil, err
					}
					row[key] = decrypted
				}
			}
		}
	}

	return results, nil
}

func (db *DatabaseHelper) FindByToken(table string, token string) (map[string]interface{}, error) {
	var results []map[string]interface{}

	query := map[string]string{
		"token": token,
	}

	_, err := db.client.From(table).Select("*", "", false).Match(query).ExecuteTo(&results)
	if err != nil {
		return nil, err
	}

	if len(results) == 0 {
		return nil, nil
	}

	for key, value := range results[0] {
		if str, ok := value.(string); ok {
			if key == "timetable" {
				var jsonData interface{}
				if err := json.Unmarshal([]byte(str), &jsonData); err != nil {
					return nil, err
				}
				results[0][key] = jsonData
			} else if key != "regNumber" && key != "token" && key != "lastUpdated" && key != "timetable" && key != "ophour" {
				decrypted, err := db.decrypt(str)
				if err != nil {
					return nil, err
				}
				var jsonData interface{}
				if err := json.Unmarshal([]byte(decrypted), &jsonData); err != nil {
					return nil, err
				}
				results[0][key] = jsonData
			}
		}
	}

	return results[0], nil
}

func (db *DatabaseHelper) GetOphourByToken(token string) (string, error) {
	var results []map[string]interface{}

	query := map[string]string{
		"token": token,
	}

	_, err := db.client.From("goscrape").Select("ophour", "", false).Match(query).ExecuteTo(&results)
	if err != nil {
		return "", err
	}

	if len(results) == 0 {
		return "", nil
	}

	ophour, ok := results[0]["ophour"].(string)
	if !ok {
		return "", nil
	}
	return ophour, nil
}
