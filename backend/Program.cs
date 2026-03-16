using Microsoft.AspNetCore.Builder;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using backend.Models; 
using backend.Interfaces;
using backend.Repositories;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Threading.Tasks; 
using Microsoft.Extensions.DependencyInjection; 
using Microsoft.Extensions.Hosting; 
using System; 
using backend.Dtos;
using System.Text.Json.Serialization;


var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

// 1. CORS Servisi
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// 2. Veritabanı servisi
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// 3. Identity Servisleri
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Lockout.AllowedForNewUsers = true;
        
        // Şifre Kuralları (Geliştirme için basit bıraktık)
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
        options.Password.RequiredLength = 3;

        // E-posta Ayarları
        options.User.RequireUniqueEmail = true;

        // 2. KRİTİK AYAR: Normal kullanıcıların girebilmesi için onayı kapattık
        options.SignIn.RequireConfirmedAccount = false; // TRUE İDİ, FALSE YAPTIK
        options.SignIn.RequireConfirmedEmail = false;   // TRUE İDİ, FALSE YAPTIK
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// 4. JWT Authentication Ayarları
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtKey = builder.Configuration["Jwt:Key"];
    if (string.IsNullOrEmpty(jwtKey))
    {
        throw new InvalidOperationException("JWT anahtarı appsettings.json'da tanımlanmamış.");
    }
    
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// 5. HttpContext Accessor
builder.Services.AddHttpContextAccessor();

// 6. Dependency Injection (Bağımlılıklar)
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>)); 
builder.Services.AddScoped<ITravelLogRepository, TravelLogRepository>();   
builder.Services.AddScoped<ITravelLogService, TravelLogService>();         
builder.Services.AddScoped<IAuthService, AuthService>();                 
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IEmailService, EmailService>();                 
builder.Services.AddScoped<IInteractionService, InteractionService>();
// ------------------------------------------------------------------

// Controller ve JSON Ayarları
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.WriteIndented = true;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 7. Veritabanı Tohumlama
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        
        await SeedDatabaseAsync(roleManager, userManager);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Veritabanı tohumlama sırasında bir hata oluştu.");
    }
}

// 8. Middleware Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(MyAllowSpecificOrigins);
app.UseStaticFiles(); 

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();


// --- TOHUMLAMA METODU ---
async Task SeedDatabaseAsync(RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager)
{
    string adminRoleName = "Admin";
    string userRoleName = "User"; 

    if (!await roleManager.RoleExistsAsync(adminRoleName))
    {
        await roleManager.CreateAsync(new IdentityRole(adminRoleName));
    }
    
    if (!await roleManager.RoleExistsAsync(userRoleName))
    {
        await roleManager.CreateAsync(new IdentityRole(userRoleName));
    }

    string adminEmail = "admin@gezgin.com";
    string adminPassword = "Admin!123";

    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    if (adminUser == null)
    {
        adminUser = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            EmailConfirmed = true 
        };
        var result = await userManager.CreateAsync(adminUser, adminPassword);

        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, adminRoleName);
        }
    }
}