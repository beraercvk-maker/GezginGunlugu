using backend.Interfaces;
using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace backend.Services
{
    public class EmailService : IEmailService
    {
        // Constructor boş kalsa da olur ama yapı bozulmasın diye bırakıyoruz
        public EmailService(IConfiguration configuration) { }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            // --- AYARLARI ELLE GİRİYORUZ (KESİN ÇALIŞMASI İÇİN) ---
            var smtpHost = "smtp.gmail.com";
            var smtpPort = 587;
            var fromEmail = "gezgingunlugu38@gmail.com"; 
            var password = "xxwstjpafbxgybvi"; // Senin şifren
            // -----------------------------------------------------

            var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(fromEmail, password),
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Timeout = 3000 // DİKKAT: 3 Saniye içinde bağlanamazsa pes etsin (Donmayı önler)
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail, "Gezgin Gunlugu"),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);

            // Hata kontrolünü AuthService'de yapacağız, burası sadece göndersin
            await client.SendMailAsync(mailMessage);
        }
    }
}