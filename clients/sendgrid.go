// using SendGrid's Go Library
// https://github.com/sendgrid/sendgrid-go
package clients

import (
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"golang.org/x/net/html"
)

const (
	MaxEmailAddressLength = 254
	MaxSubjectLineLength  = 78
)

type Email struct {
	client *sendgrid.Client
}

func NewEmail(apiKey string) *Email {
	client := sendgrid.NewSendClient(apiKey)
	return &Email{
		client: client,
	}
}

// TODO update to accept message object
func (e *Email) Send() error {
	from := mail.NewEmail("Example User", "hlhendy@gmail.com")
	subject := "Sending with SendGrid is Fun"
	to := mail.NewEmail("Example User", "hlhendy@gmail.com")
	plainTextContent := "and easy to do anywhere, even with Go"
	htmlContent := "<strong>and easy to do anywhere, even with Go</strong>"
	message := mail.NewSingleEmail(from, subject, to, plainTextContent, htmlContent)
	response, err := e.client.Send(message)
	if err != nil {
		log.Println(err)
	} else {
		fmt.Println(response.StatusCode)
		fmt.Println(response.Body)
		fmt.Println(response.Headers)
	}

	return nil
}

type Message struct {
	RecipientEmail string `json:"to"`
	RecipientName  string `json:"to_name"`
	SenderEmail    string `json:"from"`
	SenderName     string `json:"from_name"`
	Subject        string `json:"subject"`
	HTMLBody       string `json:"body"`

	// PlainTextBody stores the body of the email with HTML stripped out
	PlainTextBody string `json:"plain_text_body,omitempty"`
}

// Validate does some basic checks on the data and populates the PlainTextBody field
func (m *Message) Validate() error {

	if len(m.RecipientEmail) > MaxEmailAddressLength {
		return errors.New("INVALID_ARG_TO_EXCEEDS_MAX_LENGTH")
	}

	if len(m.SenderEmail) > MaxEmailAddressLength {
		return errors.New("INVALID_ARG_FROM_EXCEEDS_MAX_LENGTH")
	}

	if len(m.Subject) > MaxSubjectLineLength {
		return errors.New("INVALID_ARG_SUBJECT_EXCEEDS_MAX_LENGTH")
	}

	m.PlainTextBody = getPlainText(m.HTMLBody)

	return nil

}

func getPlainText(htmlBody string) string {
	tokenizer := html.NewTokenizer(strings.NewReader(htmlBody))
	prevToken := tokenizer.Token()

	var plainText string

tokenizerLoop:
	for {
		t := tokenizer.Next()
		switch {
		case t == html.ErrorToken:
			break tokenizerLoop // end of html
		case t == html.TextToken:
			if prevToken.Data == "script" {
				continue
			}
			text := html.UnescapeString(string(tokenizer.Text()))
			plainText += strings.TrimSpace(text)
		}
	}
	return plainText
}
