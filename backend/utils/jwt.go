package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

var jwtKey = []byte(getJWTKey())

func getJWTKey() string {
    key := os.Getenv("JWT_SECRET")
    if key == "" {
        panic("JWT_SECRET environment variable is not set")
    }
    return key
}

type Claims struct {
	UserID int `json:"user_id"`
	jwt.RegisteredClaims
}

// GenerateJWT generates a JWT token for a given user ID
func GenerateJWT(userID int) (string, error) {
	claims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * 30 * time.Hour)), // Token expires in 30 days
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

// ValidateJWT validates a JWT token and extracts its claims
func ValidateJWT(tokenStr string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}

	return claims, nil
}
