using Microsoft.AspNetCore.Identity;

namespace INTEX.API.Data;

//fake class for email authentication, does not need to actually be implemented, but does limit errors
public class NoOpEmailSender<TUser> : IEmailSender<TUser> where TUser : class
{
    public Task SendConfirmationLinkAsync(TUser user, string email, string confirmationLink) =>
        Task.CompletedTask;

    public Task SendPasswordResetLinkAsync(TUser user, string email, string resetLink) =>
        Task.CompletedTask;

    public Task SendPasswordResetCodeAsync(TUser user, string email, string resetCode)
    {
        throw new NotImplementedException();
    }

    public Task SendEmailAsync(TUser user, string email, string subject, string htmlMessage) =>
        Task.CompletedTask;
}