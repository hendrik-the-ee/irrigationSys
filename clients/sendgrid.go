// using SendGrid's Go Library
// https://github.com/sendgrid/sendgrid-go
package clients

import (
	"errors"
	"fmt"
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
	client    *sendgrid.Client
	fromEmail string
	toEmail   string
	ccEmail   string
}

func NewEmail(apiKey string, fromEmail, toEmail, ccEmail string) *Email {
	client := sendgrid.NewSendClient(apiKey)
	return &Email{
		client:    client,
		fromEmail: fromEmail,
		toEmail:   toEmail,
		ccEmail:   ccEmail,
	}
}

func (e *Email) Send(soilTemp float32, warningType string) error {
	from := mail.NewEmail("Hydrobot", e.fromEmail)
	subject := fmt.Sprintf("Warning! Temp in the greenhouse is too %s", warningType)
	to := mail.NewEmail("Greenhouse Staff", e.toEmail)
	cc := mail.NewEmail("Greenhouse Staff", e.ccEmail)
	plainTextBase := fmt.Sprintf("The temp in the greenhouse is %f&#176; C ", soilTemp)
	plainTextContent := ""
	htmlContent := ""
	if warningType == "high" {
		plainTextContent = fmt.Sprintf("%s, go open it!", plainTextBase)
		htmlContent = fmt.Sprintf("<strong>%s</strong>", plainTextContent)
	}
	if warningType == "low" {
		plainTextContent = fmt.Sprintf("%s, go close it!", plainTextBase)
		htmlContent = fmt.Sprintf("<strong>%s</strong>", plainTextContent)
	}
	message := mail.NewSingleEmail(from, subject, to, plainTextContent, htmlContent)
	message.Personalizations[0].AddCCs(cc)
	_, err := e.client.Send(message)
	if err != nil {
		return err
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
