using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Services.AddHttpClient();

        var app = builder.Build();

        app.MapPost("/api/contact", async (ContactRequest request, IHttpClientFactory httpClientFactory, IConfiguration configuration, CancellationToken cancellationToken) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name)
                || string.IsNullOrWhiteSpace(request.Email)
                || string.IsNullOrWhiteSpace(request.Phone)
                || string.IsNullOrWhiteSpace(request.Message))
            {
                return Results.BadRequest(new { message = "Preencha nome, email, telefone e mensagem." });
            }

            if (!request.Email.Contains('@'))
            {
                return Results.BadRequest(new { message = "Informe um email valido." });
            }

            var resendApiKey = configuration["RESEND_API_KEY"];
            var resendFromEmail = configuration["RESEND_FROM_EMAIL"];

            if (string.IsNullOrWhiteSpace(resendApiKey) || string.IsNullOrWhiteSpace(resendFromEmail))
            {
                return Results.Problem(
                    detail: "Servico de email nao configurado. Defina RESEND_API_KEY e RESEND_FROM_EMAIL no ambiente.",
                    statusCode: StatusCodes.Status500InternalServerError);
            }

            var client = httpClientFactory.CreateClient();
            client.BaseAddress = new Uri("https://api.resend.com/");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", resendApiKey);

            var bodyText = $"""
                Novo contato pelo site Noite do Burger Solidario

                Nome: {request.Name}
                Email: {request.Email}
                Telefone: {request.Phone}

                Mensagem:
                {request.Message}
                """;

            var bodyHtml = $"""
                <h2>Novo contato pelo site Noite do Burger Solidario</h2>
                <p><strong>Nome:</strong> {System.Net.WebUtility.HtmlEncode(request.Name)}</p>
                <p><strong>Email:</strong> {System.Net.WebUtility.HtmlEncode(request.Email)}</p>
                <p><strong>Telefone:</strong> {System.Net.WebUtility.HtmlEncode(request.Phone)}</p>
                <p><strong>Mensagem:</strong></p>
                <p>{System.Net.WebUtility.HtmlEncode(request.Message).Replace(Environment.NewLine, "<br />").Replace("\n", "<br />")}</p>
                """;

            var resendRequest = new ResendEmailRequest(
                resendFromEmail,
                ["veneravel@arteecienca.org", "wagenheimer@gmail.com"],
                $"Novo contato do site: {request.Name}",
                bodyHtml,
                bodyText,
                request.Email);

            using var response = await client.PostAsJsonAsync("emails", resendRequest, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
                return Results.Problem(
                    detail: $"Falha ao enviar email pelo Resend: {errorBody}",
                    statusCode: StatusCodes.Status502BadGateway);
            }

            return Results.Ok(new { message = "Mensagem enviada com sucesso." });
        });

        app.UseDefaultFiles();
        app.UseStaticFiles();

        app.Run();
    }

    private sealed record ContactRequest(
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("email")] string Email,
        [property: JsonPropertyName("phone")] string Phone,
        [property: JsonPropertyName("message")] string Message);

    private sealed record ResendEmailRequest(
        [property: JsonPropertyName("from")] string From,
        [property: JsonPropertyName("to")] string[] To,
        [property: JsonPropertyName("subject")] string Subject,
        [property: JsonPropertyName("html")] string Html,
        [property: JsonPropertyName("text")] string Text,
        [property: JsonPropertyName("reply_to")] string ReplyTo);
}
