package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"Most/internal/players/models"
	"Most/internal/players/services"
	"Most/internal/response"
)

const (
	// uploadsDir is the folder where the player images are stored on the server.
	uploadsDir = "./uploads/players"
	// uploadsURL is the path we save in the database (profile_image column).
	uploadsURL = "/uploads/players"
	// maxImageSize is the biggest image we accept (5 MB).
	maxImageSize = 5 << 20
	// maxRequestSize is a bit bigger than maxImageSize to leave room for the text fields.
	maxRequestSize = maxImageSize + (1 << 20)
)

// allowedImageTypes links the image content type to the extension we save the file with.
var allowedImageTypes = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
}

// createPlayerResponse is the body returned with HTTP 201.
type createPlayerResponse struct {
	Message string        `json:"message"`
	Player  models.Player `json:"player"`
}

// Creat_player_Info handles POST /api/players (multipart/form-data with the player image).
func Creat_player_Info(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxRequestSize)

	if err := r.ParseMultipartForm(maxImageSize); err != nil {
		response.BadRequest(w, "invalid form data: please send multipart/form-data")
		return
	}

	// 1. Required text fields.
	firstName := strings.TrimSpace(r.FormValue("first_name"))
	if firstName == "" {
		response.BadRequest(w, "first_name is required")
		return
	}

	lastName := strings.TrimSpace(r.FormValue("last_name"))
	if lastName == "" {
		response.BadRequest(w, "last_name is required")
		return
	}

	rawDateOfBirth := strings.TrimSpace(r.FormValue("date_of_birth"))
	if rawDateOfBirth == "" {
		response.BadRequest(w, "date_of_birth is required")
		return
	}

	dateOfBirth, err := services.ParseDateOfBirth(rawDateOfBirth)
	if err != nil {
		writeServiceError(w, err)
		return
	}

	// 2. Optional numbers.
	heightCM := 0
	if rawHeight := strings.TrimSpace(r.FormValue("height_cm")); rawHeight != "" {
		heightCM, err = strconv.Atoi(rawHeight)
		if err != nil {
			response.BadRequest(w, fmt.Sprintf("height_cm must be a number between %d and %d", services.MinHeightCM, services.MaxHeightCM))
			return
		}
	}

	weightKG := 0.0
	if rawWeight := strings.TrimSpace(r.FormValue("weight_kg")); rawWeight != "" {
		weightKG, err = strconv.ParseFloat(rawWeight, 64)
		if err != nil {
			response.BadRequest(w, fmt.Sprintf("weight_kg must be a number between %d and %d", services.MinWeightKG, services.MaxWeightKG))
			return
		}
	}

	// 3. The image.
	image, header, err := r.FormFile("profile_image")
	if err == http.ErrMissingFile {
		response.BadRequest(w, "profile_image is required")
		return
	}
	if err != nil {
		response.BadRequest(w, "profile_image is required and must be sent as a file")
		return
	}
	defer image.Close()

	if header.Size > maxImageSize {
		response.BadRequest(w, "profile_image is too big, the maximum is 5 MB")
		return
	}

	extension, err := imageExtension(image)
	if err != nil {
		response.BadRequest(w, "profile_image must be a JPG, JPEG, PNG or WEBP image")
		return
	}

	fileName, err := saveImage(image, extension)
	if err != nil {
		response.InternalServerError(w, "can't save the uploaded image")
		return
	}

	// 4. Build the player and store only the image path.
	player := models.Player{
		FirstName:     firstName,
		LastName:      lastName,
		Phone:         strings.TrimSpace(r.FormValue("phone")),
		DateOfBirth:   dateOfBirth,
		Position:      strings.TrimSpace(r.FormValue("position")),
		Category:      strings.TrimSpace(r.FormValue("category")),
		HeightCM:      heightCM,
		WeightKG:      weightKG,
		PreferredFoot: strings.TrimSpace(r.FormValue("preferred_foot")),
		PreviousTeam:  strings.TrimSpace(r.FormValue("previous_team")),
		ProfileImage:  uploadsURL + "/" + fileName,
	}

	player, err = services.CreatePlayer(player)
	if err != nil {
		// the file is already on disk, remove it so we keep no orphan image.
		os.Remove(filepath.Join(uploadsDir, fileName))
		if errors.Is(err, services.ErrInvalidInput) {
			writeServiceError(w, err)
			return
		}
		response.InternalServerError(w, "can't save the player")
		return
	}

	response.JSON(w, http.StatusCreated, createPlayerResponse{
		Message: "Player created successfully",
		Player:  player,
	})
}

// imageExtension checks the real content of the uploaded file and returns the
// extension to use. http.DetectContentType looks at the file content, so a renamed
// .exe is rejected here.
func imageExtension(image multipart.File) (string, error) {
	firstBytes := make([]byte, 512)
	read, err := image.Read(firstBytes)
	if err != nil && err != io.EOF {
		return "", err
	}

	extension, ok := allowedImageTypes[http.DetectContentType(firstBytes[:read])]
	if !ok {
		return "", fmt.Errorf("unsupported image type")
	}

	// Go back to the beginning of the file before saving it.
	if _, err := image.Seek(0, io.SeekStart); err != nil {
		return "", err
	}

	return extension, nil
}

// saveImage writes the uploaded image inside uploadsDir with a unique name
// (so two players never share the same file) and returns that name.
func saveImage(source multipart.File, extension string) (string, error) {
	if err := os.MkdirAll(uploadsDir, 0o755); err != nil {
		return "", err
	}

	for attempt := 0; attempt < 5; attempt++ {
		randomBytes := make([]byte, 8)
		if _, err := rand.Read(randomBytes); err != nil {
			return "", err
		}
		fileName := hex.EncodeToString(randomBytes) + extension

		// O_EXCL makes Create fail if the file already exists: never overwrite.
		destination, err := os.OpenFile(filepath.Join(uploadsDir, fileName), os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o644)
		if os.IsExist(err) {
			continue // name already used, try another one
		}
		if err != nil {
			return "", err
		}

		if _, err := io.Copy(destination, io.LimitReader(source, maxImageSize)); err != nil {
			destination.Close()
			os.Remove(filepath.Join(uploadsDir, fileName))
			return "", err
		}
		if err := destination.Close(); err != nil {
			return "", err
		}

		return fileName, nil
	}

	return "", fmt.Errorf("can't generate a unique file name")
}
