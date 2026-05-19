# 🍽️ თბილისის კვების გიდი — პროექტის გეგმა

## პროექტის აღწერა

ვებ პლატფორმა თბილისში პირველად ჩამოსული ტურისტებისთვის. მომხმარებელი პოულობს კვების ობიექტებს ინტერაქტიული რუკით, ფილტრავს უბნებისა და კატეგორიების მიხედვით, კითხულობს და ტოვებს კომენტარებს.

---

## Tech Stack

| ნაწილი | ტექნოლოგია |
|---|---|
| Frontend | React |
| Maps | Google Maps JavaScript API |
| მონაცემები | Google Places API |
| Auth | Firebase Authentication |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Frontend Hosting | Vercel |
| Backend Hosting | Railway |

---

## Google Places API — მნიშვნელოვანი ინფო

- **უფასო კრედიტი:** $200 თვეში
- **MVP-ზე საკმარისია:** ~900 უნიკალური ვიზიტორი დღეში
- **Budget Alert:** Google Cloud Console-ში დააყენე გაფრთხილება $150-ზე
- **Billing Cap:** დააყენე ლიმიტი რომ $200-ს არ გადააჭარბოს
- **მონიტორინგი:** Google Cloud Console → APIs → Quotas

---

## ფუნქციონალი

### კვების ობიექტების კატეგორიები
- 🍽️ რესტორანი
- ☕ კაფე
- 🍔 სწრაფი კვება

### ფილტრები
- კატეგორიით (რესტორანი / კაფე / სწრაფი კვება)
- უბნით (ინტერაქტიული სურათი)

### კომენტარების სისტემა
- კომენტარის დასაწერად საჭიროა რეგისტრაცია
- რეიტინგი ★ 1-5
- კომენტარების სია ობიექტზე

### ენა
- პირველ რიგში ქართული
- შემდეგ ინგლისური (i18n)

---

## უბნების ინტერაქტიული ფილტრი

### კონცეფცია
სტატიკური სურათი თბილისის უბნებით სადაც თითოეული უბანი არის კლიკადური მრავალკუთხედი (polygon). Hover-ზე ფერი იცვლება, კლიკზე — Google Maps ფილტრდება.

### როგორ გაკეთდება

**ნაბიჯი 1 — სურათის მომზადება**
- მოამზადე თბილისის უბნების სურათი (PNG/SVG)
- სურათს უნდა ჰქონდეს ფიქსირებული სიგანე (მაგ: 800px)
- ეს სიგანე იგივე უნდა იყოს საიტზეც

**ნაბიჯი 2 — Polygon კოორდინატების პოვნა**
- შედი [image-map.net](https://www.image-map.net)
- ატვირთე სურათი
- აირჩიე **Poly** ინსტრუმენტი
- გადაუარე თითოეული უბნის კიდეებს კლიკებით
- საიტი ავტომატურად გიგენერირებს `coords` მნიშვნელობებს
- დააკოპირე და JSON-ში შეინახე

**ნაბიჯი 3 — React კომპონენტი**

```jsx
const districts = [
  {
    name: "vake",
    label: "ვაკე",
    coords: "120,45,180,30,220,60,190,90,140,80",
    color: "#FF6B6B"
  },
  {
    name: "saburtalo",
    label: "საბურთალო", 
    coords: "220,60,280,45,310,80,270,100,220,95",
    color: "#4ECDC4"
  },
  // დანარჩენი უბნები...
]

function DistrictMap({ onSelect, active }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      
      {/* სურათი */}
      <img 
        src="/tbilisi-map.png" 
        width="800" 
        useMap="#tbilisi-map"
        alt="თბილისის რუკა"
      />

      {/* SVG overlay — ფერები hover/active-ზე */}
      <svg 
        style={{ position: 'absolute', top: 0, left: 0 }}
        width="800" 
        height="600"
      >
        {districts.map(d => (
          <polygon
            key={d.name}
            points={d.coords}
            fill={d.color}
            opacity={
              active === d.name ? 0.6 : 
              hovered === d.name ? 0.4 : 0
            }
            style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={() => setHovered(d.name)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect(d.name)}
          />
        ))}
      </svg>

      {/* HTML map — კლიკის არეალი */}
      <map name="tbilisi-map">
        {districts.map(d => (
          <area
            key={d.name}
            shape="poly"
            coords={d.coords}
            alt={d.label}
            onClick={() => onSelect(d.name)}
          />
        ))}
      </map>

    </div>
  )
}
```

**მნიშვნელოვანი:**
სურათი საიტზე ყოველთვის იგივე სიგანით უნდა იყოს რაც image-map.net-ზე გამოიყენე. თუ სიგანე შეიცვლა — coords აცდება.

```jsx
// ✅ სწორი — ფიქსირებული სიგანე
<img src="/tbilisi-map.png" width="800" />

// ❌ არასწორი — responsive სიგანე coords-ს ადევნება
<img src="/tbilisi-map.png" style={{ width: '100%' }} />
```

---

## ფაზები

### Phase 1 — MVP (4-6 კვირა)
- [ ] Google Cloud პროექტის დაყენება + API Key
- [ ] Budget Alert და Billing Cap კონფიგურაცია
- [ ] React პროექტის სტრუქტურა
- [ ] Google Maps JavaScript API ინტეგრაცია
- [ ] Google Places API — კვების ობიექტების ჩვენება
- [ ] პინები რუკაზე კატეგორიით (🍽️ ☕ 🍔)
- [ ] ობიექტის დეტალების გვერდი (ფოტო, მისამართი, საათები, ტელეფონი)
- [ ] კატეგორიის ფილტრი

### Phase 2 — უბნების ფილტრი (2-3 კვირა)
- [ ] თბილისის უბნების სურათის მომზადება
- [ ] image-map.net-ზე polygon კოორდინატების პოვნა
- [ ] DistrictMap React კომპონენტი
- [ ] SVG overlay hover/active ეფექტებით
- [ ] უბნის ფილტრი Google Maps-თან დაკავშირება

### Phase 3 — Auth + კომენტარები (3-4 კვირა)
- [ ] Firebase Authentication (Email + Google)
- [ ] PostgreSQL სქემა (users, reviews, ratings)
- [ ] Node.js + Express API
- [ ] კომენტარის დატოვება (მხოლოდ დარეგისტრირებულებს)
- [ ] რეიტინგი ★ 1-5
- [ ] კომენტარების სია ობიექტის გვერდზე

### Phase 4 — პოლიშინგი (2-3 კვირა)
- [ ] ძებნა სახელით
- [ ] "რჩეულებში დამატება"
- [ ] მობილური ვერსიის ოპტიმიზაცია
- [ ] ინგლისური ენა (i18n)

---

## პროექტის სტრუქტურა

```
tbilisi-food-guide/
├── client/                   # React Frontend
│   ├── public/
│   │   └── tbilisi-map.png   # უბნების სურათი
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   │   ├── GoogleMap.jsx
│   │   │   │   └── DistrictMap.jsx   # უბნების ინტერაქტიული სურათი
│   │   │   ├── Filters/
│   │   │   │   ├── CategoryFilter.jsx
│   │   │   │   └── DistrictFilter.jsx
│   │   │   ├── Place/
│   │   │   │   ├── PlaceCard.jsx
│   │   │   │   ├── PlaceDetail.jsx
│   │   │   │   └── ReviewList.jsx
│   │   │   └── Auth/
│   │   │       ├── Login.jsx
│   │   │       └── Register.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── PlacePage.jsx
│   │   └── data/
│   │       └── districts.js   # უბნების coords და ინფო
│
├── server/                   # Node.js Backend
│   ├── routes/
│   │   ├── places.js
│   │   └── reviews.js
│   ├── models/
│   │   ├── User.js
│   │   └── Review.js
│   └── index.js
│
└── README.md
```

---

## მონაცემთა ბაზის სქემა

```sql
-- მომხმარებლები (Firebase Auth-იდან sync)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  firebase_uid VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- კომენტარები და რეიტინგი
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  place_id VARCHAR NOT NULL,      -- Google Places ID
  user_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## სასარგებლო ლინკები

- [Google Cloud Console](https://console.cloud.google.com) — API Key და Budget
- [Google Maps JavaScript API დოკუმენტაცია](https://developers.google.com/maps/documentation/javascript)
- [Google Places API დოკუმენტაცია](https://developers.google.com/maps/documentation/places/web-service)
- [image-map.net](https://www.image-map.net) — Polygon კოორდინატები
- [Firebase Console](https://console.firebase.google.com) — Authentication
