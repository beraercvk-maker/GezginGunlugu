#  Gezgin Günlüğü (Travel Diary & Management)

Gezgin Günlüğü, kullanıcıların seyahat anılarını ve lokasyon/şirket bazlı kayıtlarını tutabildiği, fotoğraflar ekleyebildiği Full-Stack bir web uygulamasıdır. 

Modern web mimarisine uygun olarak Backend ve Frontend birbirinden bağımsız (API tabanlı) çalışacak şekilde tasarlanmıştır. Güvenlik için JWT (JSON Web Token) kimlik doğrulaması kullanılmıştır.

##  Kullanılan Teknolojiler

**Backend:**
* C# & .NET Core Web API
* Entity Framework Core (Code-First)
* SQL Server
* JWT Authentication
* Mail Gönderim Entegrasyonu (SMTP)

**Frontend:**
* React.js
* Axios (API İstekleri)
* LocalStorage / SessionStorage (Token Yönetimi)

## Kurulum ve Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyebilirsiniz.

### 1. Backend Kurulumu
1. Repoyu bilgisayarınıza indirin: `git clone https://github.com/beraercvk-maker/GezginGunlugu.git`
2. `backend` klasörüne gidin ve `appsettings.json` dosyasını kendi veritabanı ve mail bilgilerinize göre güncelleyin.
3. Terminalde `dotnet ef database update` komutu ile veritabanını oluşturun.
4. `dotnet run` komutu ile projeyi ayağa kaldırın. (Backend **http://localhost:5000** portunda çalışacaktır).

### 2. Frontend Kurulumu
1. Terminalde `frontend` klasörünün içine girin.
2. Gerekli paketleri indirmek için `npm install` komutunu çalıştırın.
3. Uygulamayı başlatmak için `npm run dev` komutunu kullanın. (Frontend **http://localhost:3000** portunda çalışacaktır).

##  Güvenlik Notu
Bu repoda güvenlik sebebiyle veritabanı bağlantı cümlesi (ConnectionString), JWT gizli anahtarı ve SMTP mail şifreleri `appsettings.json` içinden gizlenmiştir. Projeyi denerken bu alanları kendi bilgilerinizle doldurmanız gerekmektedir.
