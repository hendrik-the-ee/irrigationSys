// using SendGrid's Go Library
// https://github.com/sendgrid/sendgrid-go
package clients

import (
	"fmt"
	"strings"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"github.com/sirupsen/logrus"
)

type Email struct {
	log       *logrus.Entry
	client    *sendgrid.Client
	fromEmail string
	toEmail   string
	ccEmail   string
}

func NewEmail(l *logrus.Entry, apiKey, fromEmail, toEmail, ccEmail string) *Email {
	client := sendgrid.NewSendClient(apiKey)
	return &Email{
		client:    client,
		log:       l,
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
	response, err := e.client.Send(message)
	if err != nil {
		return err
	}
	if strings.Contains(response.Body, "errors") {
		e.log.Errorf("sendgrid response: %s %d....", response.Body, response.StatusCode)
		return fmt.Errorf("Error sending email: %s", response.Body)
	}

	return nil
}
