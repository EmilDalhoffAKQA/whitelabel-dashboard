# Bachelor Rapport

**White-label Chatbot Dashboard for AKQA**  
_Skalerbar multi-tenant løsning til Nestlé og fremtidige kunder_

---

**Studerende:** Emil Dalhoff Petersen  
**Studienummer:** [Dit studienummer]  
**Uddannelse:** Webudvikler, Erhvervsakademi Aarhus  
**Vejleder:** Rasmus Vase Cederdorff  
**Virksomhed:** AKQA Group Aarhus  
**Afleveringsdato:** [Dato]  
**Antal tegn:** [Antal] (ekskl. forside, indholdsfortegnelse, litteraturliste og bilag)

---

## Indholdsfortegnelse

1. Indledning
2. Problemstilling
3. Metode
4. UX & Research
5. Teknisk Arkitektur
6. White-label Implementation
7. Authentication og Adgangsstyring
8. Performance Monitoring
9. Multi-market Skalering
10. Samlet Brugeroplevelse
11. Refleksion og Evaluering
12. Konklusion
13. Litteraturliste
14. Bilag

---

## 1. Indledning (1-2 sider)

### 1.1 Baggrund

[Forklar konteksten: Hvorfor er dette projekt relevant? Hvad er behovet?]

Under min praktik hos AKQA Group arbejdede jeg på et white-label dashboard til Nestlé, som skulle understøtte deres chatbot-performance monitoring på tværs af 22 markeder. Projektet opstod som et behov for at kunne...

### 1.2 Om AKQA

[Kort beskrivelse af AKQA - brug fra din praktikrapport]

AKQA Group i Aarhus er et internationalt digitalt bureau ejet af WPP...

### 1.3 Om Nestlé og forretningsmæssig kontekst

[Beskriv Nestlé's brands (Goodnes, Recetas) og deres behov]

Nestlé har implementeret AI-drevne chatbots på flere af deres brands...

---

## 2. Problemstilling (1-2 sider)

### 2.1 Problemformulering

> Hvordan kan et skalerbart, white-label chatbot-dashboard udvikles for AKQA, så det understøtter multi-tenant funktionalitet, imødekommer Nestlés behov for skalering på tværs af 22 markeder og samtidig kan genbruges til andre kunder i fremtiden?

### 2.2 Undersøgelsesspørgsmål

**1. White-label arkitektur:**  
Hvordan designes en fleksibel platform, hvor AKQA kan tilpasse dashboardet til forskellige kunder og brands (logo, farver, layout) uden at ændre kernefunktionalitet?

**2. Authentication og adgangsstyring:**  
Hvordan implementeres sikker brugeradministration med Auth0 og magic links, så forskellige teams og roller kan få adgang til workspace-specifikke data, både for Nestlé og andre kunder?

**3. Performance monitoring og analytics:**  
Hvilke KPI'er og visualiseringer er afgørende for at give Nestlé indsigt i chatbot-performance, brugeradfærd og ROI, samtidig med at løsningen kan generaliseres til andre kunder?

**4. Multi-market skalering:**  
Hvordan håndteres sprog-, test- og content-udfordringer for Nestlé på tværs af 22 markeder, og hvordan kan arkitekturen struktureres, så den understøtter kunder med færre eller flere markeder?

**5. Samlet brugeroplevelse:**  
Hvordan kan eksisterende værktøjer (dashboard og testing-app) konsolideres til én sammenhængende service-applikation, der både fungerer for Nestlé og kan genbruges som white-label løsning for AKQA?

### 2.3 Afgrænsning

[Hvad dækker projektet IKKE? Hvad har du bevidst valgt fra?]

Dette projekt fokuserer primært på dashboard-løsningen og dens arkitektur. Projektet dækker ikke:

- Selve chatbot-implementeringen
- AI-model træning og optimering
- [Andre afgrænsninger]

### 2.4 Målgruppe

[Hvem er rapporten skrevet til?]

Denne rapport henvender sig til:

- AKQA's udviklere og projektledere som kan genbruge løsningen
- Nestlé's stakeholders som skal forstå løsningens værdi
- Akademisk vejleder og censor

---

## 3. Metode (2-3 sider)

### 3.1 Valgte metoder og tilgange

[Beskriv overordnet hvordan du har arbejdet]

Projektet er udviklet gennem en agil tilgang med fokus på iterativ udvikling og kontinuerlig feedback fra stakeholders...

### 3.2 Projektstyring - Kanban

[Forklar hvordan I organiserede arbejdet]

Vi anvendte GitHub Projects med et Kanban-board til at styre opgaver...

### 3.3 Double Diamond

[Hvis relevant - beskriv hvordan denne metode blev brugt i designfasen]

[DIAGRAM: Indsæt Double Diamond diagram i bilag, referer her]

### 3.4 Field & Desk research

[Beskriv research-processen]

**Desk research:**

- Analyse af eksisterende dashboard løsninger (Tableau, Power BI, etc.)
- Konkurrent analyse af white-label platforms
- Teknologivalg research

**Field research:**

- Interviews med Nestlé stakeholders
- Observationer af hvordan det eksisterende dashboard blev brugt
- Feedback sessions

### 3.5 User-flow og brugerrejser

[Beskriv hvordan brugerrejser blev kortlagt]

---

## 4. UX & Research (3-4 sider)

### 4.1 Desk research - Eksisterende løsninger

[Analyse af eksisterende løsninger på markedet]

**Konkurrenter analyseret:**

- Tableau Dashboard
- Power BI
- Mixpanel
- [Andre]

**Findings:**
[Hvad lærte du? Hvad kunne forbedres? Hvad inspirerede løsningen?]

### 4.2 Field research - Nestlés behov

[Beskriv hvad Nestlé specifikt havde brug for]

Gennem interviews med Nestlé's team identificerede vi følgende kernebehov:

1. Overblik over performance på tværs af 22 markeder
2. Mulighed for at sammenligne markets
3. [Flere behov]

### 4.3 User personas

[Beskriv de primære brugertyper]

**Persona 1: Marketing Manager**

- Behov: Hurtigt overblik over ROI
- Smertepunkter: Svært at sammenligne markeder
- [Mere]

**Persona 2: Data Analyst**

- Behov: Detaljerede data og mulighed for eksport
- [Mere]

### 4.4 User stories

[Konverter personas til user stories]

- "Som marketing manager vil jeg kunne se total conversations for alle markeder, så jeg kan evaluere kampagneeffektivitet"
- [Flere stories]

### 4.5 Informationsarkitektur

[Beskriv hvordan information er struktureret i løsningen]

[DIAGRAM: Indsæt IA diagram i bilag, referer her]

---

## 5. Teknisk Arkitektur (2-3 sider)

### 5.1 Techstack valg og begrundelse

**Frontend:**

- **Next.js 15** - Server-side rendering, file-based routing, API routes
- **React 19** - Component-based UI, hooks, modern patterns
- **TypeScript** - Type safety, bedre developer experience
- **Tailwind CSS + ShadCN** - Utility-first CSS, pre-built accessible components

**Backend:**

- **Supabase (PostgreSQL)** - Realtime database, built-in auth, row-level security
- **Auth0** - Industry-standard authentication, magic links support

**Deployment:**

- **Vercel** - Seamless Next.js deployment, edge functions

**Begrundelse:**
[Forklar HVORFOR disse valg blev truffet. Hvilke alternativer blev overvejet?]

Next.js blev valgt frem for create-react-app fordi [årsag]...
Auth0 blev valgt frem for custom auth fordi [årsag]...

### 5.2 Projektstruktur

[Beskriv mappestrukturen og organiseringen]

```
/app
  /(auth)/login        # Authentication flow
  /(dashboard)/[workspaceId]  # Workspace-specific routes
  /api                 # API endpoints
/components            # Reusable components
/lib                   # Utilities and configurations
```

### 5.3 Database design

[Beskriv database strukturen - vis simplificeret version]

**Centrale tabeller:**

- `workspaces` - Multi-tenant isolation
- `users` - User management
- `user_workspaces` - Many-to-many relation med roles
- `markets` - Market configuration
- `conversations` - Chat data
- `analytics_snapshots` - Performance metrics

[DIAGRAM: Vis simplificeret ER-diagram her, fuld version i bilag]

**Nøglerelationer:**

- En workspace kan have mange users (through `user_workspaces`)
- En workspace kan have mange markets
- En market kan have mange conversations

---

## 6. White-label Arkitektur (4-5 sider)

### 6.1 Krav til fleksibilitet

[Hvad skal løsningen kunne for at være white-label?]

For at AKQA kan genbruge løsningen til andre kunder, skal følgende være fleksibelt:

1. Visual branding (logo, farver)
2. Funktionalitet (hvilke widgets vises)
3. Data isolation (sikkerhed mellem kunder)
4. Onboarding flow

### 6.2 Workspace-baseret multi-tenant løsning

[Forklar workspace konceptet - dette er KERNEN i white-label]

**Hvad er et workspace?**
Et workspace repræsenterer en kunde (f.eks. Nestlé, eller en fremtidig kunde). Hvert workspace har:

- Unik ID
- Eget branding (theme config)
- Egne users med roller
- Egne markets
- Egen data (conversations, analytics)

**Multi-tenant sikkerhed:**
Data isolation sikres gennem:

1. Database-niveau: Alle queries filtreres på `workspace_id`
2. Middleware-niveau: Route protection
3. API-niveau: Verificering af workspace access

[Se Bilag X for database security policies]

### 6.3 Branding Customization

#### 6.3.1 Logo Upload

[Beskriv hvordan logo upload fungerer]

Når en workspace oprettes, kan admins uploade et logo gennem:

```typescript
// Simplified example - see Bilag for full implementation
const uploadLogo = async (file: File, workspaceId: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("workspaceId", workspaceId);

  const response = await fetch("/api/upload/logo", {
    method: "POST",
    body: formData,
  });

  return response.json();
};
```

Logo'et gemmes i Supabase Storage og URL'en opdateres i `workspaces.logo_url`.

#### 6.3.2 Farvetema (Theme Config)

[Beskriv theme system]

Theme configuration gemmes som JSONB i databasen:

```typescript
interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  favicon: string;
}
```

Dette giver fleksibilitet til at:

- Tilføje nye theme properties uden database migrationer
- Gemme komplekse konfigurationer (nested objects)
- Validere med TypeScript types

**Dynamic theme application:**
Theme appliceres runtime ved page load gennem CSS custom properties:

```typescript
document.documentElement.style.setProperty(
  "--primary-color",
  themeConfig.primaryColor
);
```

[Se Bilag for fuld implementering]

#### 6.3.3 Layout Customization

[Beskriv widget systemet som del af customization]

Hvert workspace kan customize sit dashboard layout gennem widget systemet...

### 6.4 Kodeeksempel: Workspace Context

[Vis hvordan workspace data håndteres i applikationen]

```typescript
// app/(dashboard)/[workspaceId]/layout.tsx
async function getWorkspaceData(workspaceId: string, userEmail: string) {
  // Verify user has access to workspace
  const { data: userWorkspace } = await supabaseAdmin
    .from("user_workspaces")
    .select("role, workspace_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .single();

  if (!userWorkspace) {
    redirect("/workspaces"); // No access
  }

  // Fetch workspace with theme
  const { data: workspace } = await supabaseAdmin
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  return { workspace, role: userWorkspace.role };
}
```

_Se Bilag C for komplet implementering af workspace layout._

### 6.5 Refleksion: Skalerbarhed og genanvendelighed

[VIGTIG del - reflekter over løsningen]

**Hvordan kan AKQA genbruge denne løsning?**

Når AKQA får en ny kunde, skal de blot:

1. Oprette et nyt workspace i databasen
2. Invite kunde's admin user
3. Kunden uploader eget logo og vælger farver
4. Kunden konfigurerer sine markets

Hele kerneapplikationen forbliver den samme.

**Styrker ved workspace-modellen:**

- Fuld data isolation
- Nem onboarding af nye kunder
- Fleksibel branding per kunde
- Skalerbar arkitektur

**Svagheder og udfordringer:**

- Kompleksitet i query-lag (alle queries skal filtres)
- Database performance ved mange workspaces (løsning: indexing)
- Edge cases med cross-workspace features (f.eks. hvis to kunder vil samarbejde)

**Sammenligning med alternativer:**
En alternativ tilgang kunne være separate databaser per kunde (database-per-tenant), men dette ville:

- Øge infrastruktur kompleksitet
- Gøre cross-tenant analyser umulige
- Øge deployment tid for nye kunder

Workspace-modellen (schema-based multi-tenancy) blev derfor valgt som den optimale balance mellem isolation og skalerbarhed.

---

## 7. Authentication og Adgangsstyring (3-4 sider)

### 7.1 Auth0 Integration

[Forklar hvorfor Auth0 og hvordan det fungerer]

**Hvorfor Auth0?**
Auth0 blev valgt frem for custom authentication fordi:

- Industry-standard sikkerhed
- Built-in magic links (passwordless)
- Social login support (fremtidig feature)
- Compliance (GDPR, SOC2)
- Management API for user administration

**Alternative løsninger overvejet:**

- Supabase Auth: Integrerer godt med database, men mindre fleksibelt
- Custom auth: Fuld kontrol, men større sikkerhedsrisiko
- Firebase Auth: God løsning, men vendor lock-in til Google

### 7.2 Magic Links Implementation

[Beskriv passwordless flow]

Magic links giver en friktionsfri login-oplevelse:

1. User indtaster email på `/login`
2. Auth0 sender magic link til email
3. User klikker link
4. Auth0 redirecter til `/api/auth/callback`
5. Session oprettes og user redirectes til `/workspaces`

[DIAGRAM: Indsæt auth flow diagram - se bilag for fuld version]

**Sikkerhedsmæssige overvejelser:**

- Magic links er single-use og expire efter 5 minutter
- Links er bundet til session (ikke transferable mellem devices)
- CSRF protection gennem state parameter

### 7.3 User Roles

[Beskriv role systemet]

Løsningen implementerer tre rolle-niveauer:

**Superadmin:**

- Kan oprette nye workspaces
- Kan invite users til alle workspaces
- Kan ændre workspace settings
- AKQA's administrative team

**Admin:**

- Kan invite users til deres workspace
- Kan ændre workspace branding
- Kan oprette markets
- Kunden's administrative team

**Editor:**

- Kan se data og analytics
- Kan ikke ændre settings
- Read-only access
- Kunden's analytikere og marketingfolk

**Implementation:**
Roles gemmes i `user_workspaces` tabellen (junction table):

```typescript
export type UserRole = "superadmin" | "admin" | "editor";

interface UserWorkspace {
  user_id: string;
  workspace_id: string;
  role: UserRole;
}
```

Dette giver fleksibilitet til at:

- En user kan have forskellige roles i forskellige workspaces
- En user kan være admin i ét workspace og editor i et andet
- Role-baseret UI (conditional rendering)

### 7.4 Workspace-baseret Adgangskontrol

[Beskriv hvordan access control håndteres]

**Database-niveau (Row Level Security):**

```sql
-- Example policy for conversations table
CREATE POLICY "Users can only see conversations in their workspaces"
ON conversations
FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id
    FROM user_workspaces
    WHERE user_id = auth.uid()
  )
);
```

_Se Bilag for alle RLS policies_

**API-niveau:**
Alle API endpoints verificerer workspace access:

```typescript
// Example API route
export async function GET(request: Request) {
  const session = await getSession();
  const { workspaceId } = await request.json();

  // Verify user has access to workspace
  const hasAccess = await verifyWorkspaceAccess(session.user.id, workspaceId);

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Proceed with query...
}
```

### 7.5 Middleware og Route Protection

[Beskriv Next.js middleware]

Next.js middleware beskytter routes på server-side før page load:

```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token");
  const pathname = request.nextUrl.pathname;

  // Protect workspace routes
  const isProtectedRoute = /^\/[^/]+\//.test(pathname);

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
```

_Se Bilag for fuld middleware implementation_

### 7.6 Sikkerhedsmæssige Overvejelser

[Reflekter over security]

**OWASP Top 10 considerations:**

1. **Broken Access Control** → Mitigeret gennem RLS og middleware
2. **Cryptographic Failures** → Auth0 håndterer token encryption
3. **Injection** → Supabase client sikrer parameterized queries
4. **[Andre relevante]**

**Fremtidige forbedringer:**

- Two-factor authentication
- Audit logs for admin actions
- IP whitelisting for superadmin

---

## 8. Performance Monitoring (3-4 sider)

### 8.1 KPI Definition

[Definer hvilke metrics der vises og hvorfor]

**Valgte KPI'er:**

1. **Total Conversations**

   - Definition: Antal samtaler i periode
   - Værdi: Indikerer engagement og adoption
   - Visualisering: StatCard med trend

2. **Active Users Today**

   - Definition: Unikke users der har interageret i dag
   - Værdi: Real-time aktivitet måling
   - Visualisering: StatCard

3. **Average Response Time**

   - Definition: Gennemsnitlig tid før chatbot svarer
   - Værdi: Performance indikator
   - Visualisering: Line chart (trend over tid)

4. **Resolution Rate**

   - Definition: % af conversations der løses uden human intervention
   - Værdi: Bot effectiveness
   - Visualisering: Gauge chart

5. **Customer Sentiment**

   - Definition: Distribution af positive/neutral/negative sentiment
   - Værdi: User satisfaction proxy
   - Visualisering: Pie chart

6. **NPS Score**
   - Definition: Net Promoter Score baseret på feedback
   - Værdi: Long-term loyalty indikator
   - Visualisering: Gauge + trend

[Se Bilag for komplette KPI definitions og formler]

**Hvorfor disse KPI'er?**
Disse metrics blev valgt gennem workshops med Nestlé's team og giver et balanceret view af:

- Volumen (conversations, users)
- Quality (sentiment, NPS)
- Performance (response time, resolution)

### 8.2 Widget System

[Beskriv det modulære widget system]

**Widget Registry Pattern:**
For at gøre dashboardet fleksibelt implementerede vi et widget registry system:

```typescript
// components/widgets/index.ts
export const WIDGET_REGISTRY = {
  TotalConversationsWidget,
  ActiveUsersTodayWidget,
  AverageResponseTimeWidget,
  ResolutionRateWidget,
  CustomerSentimentWidget,
  NPSScoreWidget,
  // ... more widgets
};

export type WidgetComponent = keyof typeof WIDGET_REGISTRY;
```

**Dynamic rendering:**
Widgets renders dynamisk baseret på workspace configuration:

```typescript
{
  layouts.map((layout) => {
    const WidgetComponent = WIDGET_REGISTRY[layout.widget_type.component_name];

    return <WidgetComponent workspaceId={workspaceId} marketId={marketId} />;
  });
}
```

**Fordele ved denne tilgang:**

- Nem at tilføje nye widgets
- Workspaces kan customize hvilke widgets de vil se
- Layout er persistent i database
- Drag-and-drop layout (fremtidig feature)

### 8.3 Data Visualisering med Recharts

[Beskriv hvordan data visualiseres]

Recharts blev valgt til data visualisering fordi:

- React-native (god DX med TypeScript)
- Responsiv out-of-the-box
- Customizable styling
- Good performance

**Eksempel: Conversation Volume Widget**
[Vis et konkret eksempel]

```typescript
export function ConversationVolumeWidget({ workspaceId, marketId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch time-series data
    fetchConversationVolume(workspaceId, marketId).then(setData);
  }, [workspaceId, marketId]);

  return (
    <LineChart data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Line type="monotone" dataKey="conversations" />
    </LineChart>
  );
}
```

_Se Bilag for alle widget implementations_

### 8.4 Real-time vs. Snapshot Data

[Beskriv data strategi]

**To-tier data arkitektur:**

1. **Real-time queries** (for seneste data):

   - Direkte queries til `conversations` tabel
   - Bruges til "Active Users Today", "Recent Conversations"
   - Slower, men altid up-to-date

2. **Snapshot data** (for historisk analyse):
   - Pre-aggregated metrics i `analytics_snapshots` tabel
   - Genereres hver time via cron job
   - Faster queries, men delay på max 1 time

**Trade-off:**
Denne hybrid tilgang balancerer:

- Performance (snapshots er hurtigere)
- Aktualitet (real-time for vigtige metrics)
- Database load (undgår heavy aggregations hver gang)

### 8.5 Generalisering til Andre Kunder

[VIGTIGT - hvordan kan andre kunder bruge samme KPI'er?]

**Fleksibilitet i widget systemet:**
Selvom Nestlé har valgt disse specifikke KPI'er, kan andre kunder:

1. Vælge et subset af widgets
2. Customize tresholds (f.eks. hvad er "good" response time)
3. Tilføje custom widgets (via widget registry)

**Eksempel: E-commerce kunde**
En e-commerce kunde kunne have brug for andre metrics:

- Product recommendation accuracy
- Cart abandonment rate
- Order completion through bot

Disse kan tilføjes som nye widgets uden at ændre kerne-arkitekturen.

---

## 9. Multi-market Skalering (4-5 sider)

### 9.1 Market Strukturering i Database

[Beskriv hvordan markets er struktureret]

Markets er en central del af arkitekturen for at supportere Nestlé's 22 markeder:

```typescript
interface Market {
  id: string;
  workspace_id: string;
  name: string; // "Pakistan", "South Africa"
  market_code: string; // "PK", "ZA"
  language: string; // "ur", "en"
  is_active: boolean;
  created_at: string;
}
```

**Relation til conversations:**

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  market_id UUID REFERENCES markets(id),  -- Links to specific market
  -- ... other fields
);
```

Dette giver mulighed for:

- Filtrering på market-niveau
- Market-specific analytics
- Cross-market comparisons

### 9.2 Sprog- og Lokaliseringshåndtering

[Beskriv hvordan sprog håndteres]

**Nuværende implementation:**
Sproget gemmes per market (`market.language`), men dashboardet er pt. på engelsk for alle users.

**Fremtidig localization:**
For at supportere multi-language dashboard UI:

1. Implement i18n (next-intl eller react-i18next)
2. Translations files per sprog
3. User language preference (separate fra market language)

**Eksempel på translations struktur:**

```typescript
// locales/en.json
{
  "dashboard.totalConversations": "Total Conversations",
  "dashboard.activeUsers": "Active Users"
}

// locales/da.json
{
  "dashboard.totalConversations": "Totale Samtaler",
  "dashboard.activeUsers": "Aktive Brugere"
}
```

### 9.3 Market-specifik Data Filtering

[Beskriv filtering logikken]

**Market Selector Component:**
Users kan vælge mellem:

- "All Markets" (global overview)
- Specific market (filtered view)

```typescript
<MarketSelector
  markets={markets}
  selectedMarket={selectedMarket}
  onMarketChange={(marketId) => {
    setSelectedMarket(marketId);
    // Widgets re-fetch data with new market filter
  }}
/>
```

**API filtering:**
Alle widget data queries respekterer market filter:

```typescript
let query = supabaseAdmin
  .from("conversations")
  .select("*")
  .eq("workspace_id", workspaceId);

// Apply market filter if specified
if (marketId && marketId !== "all") {
  query = query.eq("market_id", marketId);
}

const { data } = await query;
```

### 9.4 Global Overview vs. Market-specific Views

[Beskriv de to views]

**Global Overview:**
Viser aggregated data på tværs af alle markets:

- Total conversations across all markets
- Average metrics
- Market comparison charts

**Market-specific View:**
Drill-down til enkelt market:

- Market-specific KPI'er
- Recent conversations for that market
- Market-specific trends

**Navigation:**
Sidebar giver quick navigation:

```
├── Overview (Global)
├── Markets
│   ├── Pakistan
│   ├── South Africa
│   ├── [... 20 more markets]
├── Settings
```

### 9.5 Skalerbarhed: Fra 22 markeder til N markeder

[Diskuter skalerbarhed]

**Hvordan håndteres vækst?**

**Database skalerbarhed:**

- Markets table kan håndtere tusindvis af entries
- Indexing på `workspace_id` og `market_code` sikrer hurtige queries
- Partitioning kan implementeres ved ekstremt høje volumes

**UI skalerbarhed:**
Med 22 markets er sidebar navigation håndterbar, men ved 100+ markets:

- Implement search/filter i market selector
- Grouping by region
- Favorites system

**Performance considerations:**

- "All Markets" view aggregerer data fra alle markets
- Ved mange markets: Paginate market selector
- Lazy loading af market-specific data

**Kode eksempel: Pagination i market list**

```typescript
const [page, setPage] = useState(1);
const marketsPerPage = 20;

const paginatedMarkets = markets.slice(
  (page - 1) * marketsPerPage,
  page * marketsPerPage
);
```

### 9.6 Testing på Tværs af Markeder

[Beskriv test strategi]

**Challenges:**

- Forskellige sprog i chatbot responses
- Forskellige tidszoner
- Forskellige kulturelle kontekster

**Test approach:**

1. Seed database med test data for alle 22 markets
2. Verificer filtering fungerer for hver market
3. Edge case: Market uden data (vises som 0, ikke error)
4. Cross-market comparison accuracy

### 9.7 Refleksion

[Reflekter over market implementation]

**Hvad fungerede godt:**

- Market-struktur i database er enkel og fleksibel
- Filtering logik er consistent på tværs af alle widgets
- Global vs. specific view giver god UX

**Udfordringer:**

- Initial setup: Seeding 22 markets tog tid
- Testing: Svært at simulere real data for alle markets
- Performance: "All Markets" view kan være langsom ved høj data volume

**Alternativ implementation overvejet:**
En alternativ tilgang kunne være at bruge market_code direkte i conversations (frem for market_id relation). Dette ville:

- Simplify queries (no join needed)
- Reducere database normalization
- Men: Gøre market configuration ændringer sværere (f.eks. rename market)

Den valgte normaliserede tilgang (separate markets table) giver bedre maintainability på lang sigt.

---

## 10. Samlet Brugeroplevelse (2-3 sider)

### 10.1 Konsolidering af Eksisterende Værktøjer

[Beskriv hvordan gamle tools blev kombineret]

**Før konsolidering:**
Nestlé havde to separate tools:

1. Dashboard til at se statistikker (gamle version)
2. Testing app til at teste chatbot (separat URL)

**Problem:**

- Splitted user experience
- Dobbelt login
- Inkonsistent navigation
- Svært at finde funktioner

**Efter konsolidering:**
Alt samlet i én applikation med unified navigation gennem sidebar:

- Dashboard (statistics)
- Chat (testing interface)
- Markets (configuration)
- Settings (workspace settings)

### 10.2 Navigation og Sidebar Design

[Beskriv sidebar løsningen]

**Sidebar komponenten:**
Fast left-side navigation med:

- Workspace selector (switch mellem workspaces)
- Main navigation (Dashboard, Chat, Markets, Settings)
- Market sub-navigation (expandable)
- User menu (logout, profile)

```tsx
<AppSidebar>
  <WorkspaceSelector workspaces={workspaces} />
  <NavLinks role={userRole} /> {/* Role-based visibility */}
  <MarketList markets={markets} />
  <UserMenu user={user} />
</AppSidebar>
```

**Responsive design:**

- Desktop: Always visible
- Mobile: Collapsible drawer (hamburger menu)

### 10.3 Onboarding Flow

[Beskriv hvordan nye users kommer igennem systemet]

**New workspace onboarding (for AKQA):**

1. AKQA superadmin creates workspace
2. Uploads logo, sets colors
3. Invites customer admin via email
4. Customer admin receives magic link
5. Customer admin completes profile
6. Customer admin can now invite their team

**New user onboarding (for customers):**

1. Receives email invitation
2. Clicks magic link → Authenticated
3. Sees onboarding wizard:
   - Welcome screen
   - Tour of dashboard features
   - Setup preferences (email notifications, etc.)
4. Directed to dashboard

[DIAGRAM: Onboarding flowchart - see Bilag]

### 10.4 Responsive Design og Mobile-First

[Beskriv responsive strategi]

**Tailwind breakpoints:**

```typescript
// Example responsive widget
<div
  className="
  col-span-12     /* Mobile: full width */
  md:col-span-6   /* Tablet: half width */
  lg:col-span-4   /* Desktop: third width */
"
>
  <Widget />
</div>
```

**Mobile optimizations:**

- Touch-friendly tap targets (min 44x44px)
- Simplified navigation (drawer instead of sidebar)
- Stacked layout for widgets
- Reduced chart complexity (fewer data points on small screens)

### 10.5 Accessibility Overvejelser

[Beskriv accessibility implementation]

**WCAG 2.1 Level AA compliance:**

- Color contrast ratios (tested with Lighthouse)
- Keyboard navigation (all interactive elements)
- Screen reader support (ARIA labels)
- Focus indicators

**ShadCN benefits:**
ShadCN components kommer med built-in accessibility:

- Radix UI primitives (accessibility-first)
- Proper ARIA attributes
- Keyboard navigation

**Areas for improvement:**

- Full keyboard navigation test
- Screen reader testing with actual users
- Color blind friendly color schemes

---

## 11. Refleksion og Evaluering (3-4 sider)

### 11.1 Besvarelse af Undersøgelsesspørgsmål

[Gå systematisk igennem hver undersøgelsesspørgsmål og besvar dem]

#### White-label arkitektur

**Undersøgelsesspørgsmål:** Hvordan designes en fleksibel platform, hvor AKQA kan tilpasse dashboardet til forskellige kunder og brands (logo, farver, layout) uden at ændre kernefunktionalitet?

**Besvarelse:**
Gennem workspace-baseret multi-tenant arkitektur har vi skabt en løsning hvor...
[Opsummer løsningen kort, referer til sektion 6]

**Konklusion på spørgsmålet:**
Løsningen opfylder kravet til white-label fordi...

#### Authentication og adgangsstyring

**Undersøgelsesspørgsmål:** Hvordan implementeres sikker brugeradministration med Auth0 og magic links, så forskellige teams og roller kan få adgang til workspace-specifikke data, både for Nestlé og andre kunder?

**Besvarelse:**
[Opsummer authentication løsningen]

#### Performance monitoring og analytics

**Undersøgelsesspørgsmål:** Hvilke KPI'er og visualiseringer er afgørende for at give Nestlé indsigt i chatbot-performance, brugeradfærd og ROI, samtidig med at løsningen kan generaliseres til andre kunder?

**Besvarelse:**
[Opsummer KPI valg og widget system]

#### Multi-market skalering

**Undersøgelsesspørgsmål:** Hvordan håndteres sprog-, test- og content-udfordringer for Nestlé på tværs af 22 markeder, og hvordan kan arkitekturen struktureres, så den understøtter kunder med færre eller flere markeder?

**Besvarelse:**
[Opsummer market implementation]

#### Samlet brugeroplevelse

**Undersøgelsesspørgsmål:** Hvordan kan eksisterende værktøjer (dashboard og testing-app) konsolideres til én sammenhængende service-applikation, der både fungerer for Nestlé og kan genbruges som white-label løsning for AKQA?

**Besvarelse:**
[Opsummer UX konsolidering]

### 11.2 Tekniske Udfordringer og Løsninger

[Beskriv konkrete udfordringer du mødte og hvordan de blev løst]

**Udfordring 1: Database Performance ved "All Markets" View**
_Problem:_ Når man vælger "All Markets", skal systemet aggregere data fra alle 22 markets, hvilket resulterede i langsomme queries (3-5 sekunder).

_Løsning:_ Implementerede analytics snapshots table med pre-aggregated data, der updates hver time via cron job. Dette reducerede query tid til < 500ms.

_Læring:_ Performance optimering er critical i multi-tenant systemer. Pre-aggregation er en effektiv strategi for dashboard data.

**Udfordring 2: Workspace Access Control Edge Cases**
_Problem:_ Hvad sker der hvis en user bliver removed fra et workspace mens de er logged ind?

_Løsning:_ [Beskriv løsning]

**Udfordring 3: [Anden udfordring]**
[Beskriv flere konkrete udfordringer]

### 11.3 Samarbejde med Kunde (Nestlé)

[Reflekter over kunderelationen]

**Feedback loops:**
Vi havde regelmæssige sprint reviews med Nestlé stakeholders...

**Ændringer baseret på feedback:**
Initial design havde ikke "Global" overview, men Nestlé efterspurgte det...

**Hvad lærte jeg om kundesamarbejde:**

- Vigtigheden af at vise fremskridt løbende
- Hvordan man balancerer tekniske constraints med kundekrav
- Communication er nøglen

### 11.4 Hvad Kunne Gøres Anderledes?

[VIGTIG sektion - vis kritisk refleksion]

**Tekniske valg:**

- **Database choice:** PostgreSQL/Supabase fungerer godt, men MongoDB kunne have givet mere fleksibilitet til dynamic data structures (f.eks. theme config).

  - Pro ved current choice: ACID transactions, strong consistency
  - Con: Schema migrations kan være udfordrende

- **Widget system:** Current implementation er simpel men effektiv. En mere advanced drag-and-drop layout editor kunne have givet bedre UX.
  - Why we didn't: Time constraints
  - Future iteration: Implement react-grid-layout for customizable layouts

**Proces forbedringer:**

- Mere omfattende user testing inden launch
- Better documentation fra starten (ikke i efterhand)
- Earlier involvement af Nestlé i design decisions

### 11.5 Fremtidige Forbedringer

[Beskriv hvad der mangler/kunne forbedres]

**Technical debt:**

- Mangler comprehensive test suite (unit tests, integration tests)
- Nogle komponenter er ikke optimally performance optimeret
- API rate limiting er ikke implementeret

**Feature wishlist:**

1. Real-time updates (WebSocket eller Server-Sent Events)
2. Export functionality (CSV, PDF reports)
3. Email notifications for alerts
4. Advanced analytics (predictive models)
5. A/B testing support for chatbot variations

**Scalability improvements:**

- Implement caching layer (Redis)
- Database sharding for very large datasets
- CDN for static assets

---

## 12. Konklusion (1-2 sider)

### 12.1 Opsummering af Resultater

[Opsummer hvad der blev opnået]

Dette projekt har resulteret i et funktionelt white-label dashboard til AKQA, som understøtter Nestlé's behov for multi-market chatbot performance monitoring. De væsentligste resultater omfatter:

**Tekniske achievements:**

- Skalerbar multi-tenant arkitektur med workspace-baseret isolation
- Sikker authentication med Auth0 og role-based access control
- Fleksibelt widget system til performance monitoring
- Support for 22 markeder med mulighed for skalering

**Business value:**

- AKQA kan genbruge løsningen til fremtidige kunder
- Nestlé har unified platform til at overvåge chatbot performance
- Reduceret time-to-market for nye kunder (onboarding flow)

### 12.2 Opfyldelse af Problemformulering

[Gå tilbage til problemformuleringen og besvar den direkte]

**Problemformulering:**

> Hvordan kan et skalerbart, white-label chatbot-dashboard udvikles for AKQA, så det understøtter multi-tenant funktionalitet, imødekommer Nestlés behov for skalering på tværs af 22 markeder og samtidig kan genbruges til andre kunder i fremtiden?

**Besvarelse:**
Gennem implementeringen af en workspace-baseret multi-tenant arkitektur har vi skabt en løsning der:

1. **Er skalerbar:** Database design og caching strategi understøtter growth
2. **Er white-label:** Branding customization gennem theme config og logo upload
3. **Har multi-tenant funktionalitet:** Data isolation og workspace-baseret access control
4. **Imødekommer Nestlé's behov:** Market-specifik filtering og 22 markets support
5. **Kan genbruges:** Modulært design og clear onboarding process for nye kunder

Løsningen demonstrerer at det er muligt at bygge en generisk platform der samtidig imødekommer specifikke kundebehov.

### 12.3 Værdiskabelse for AKQA og Nestlé

[Beskriv den faktiske værdi der er skabt]

**For AKQA:**

- Reusable product til at sælge til andre kunder
- Reduced development time for fremtidige lignende projekter
- Technical competency demonstration

**For Nestlé:**

- Unified platform frem for scattered tools
- Data-driven insights til at optimere chatbot performance
- Cross-market comparisons for bedre strategiske decisions

### 12.4 Læring og Perspektivering

[Afslut med personlig refleksion]

Dette projekt har givet mig værdifuld erfaring med:

- Enterprise-level arkitektur design
- Real kunde requirements og feedback integration
- Balance mellem generisk design og specifik functionality
- Arbejde i professional development team

**Perspektivering:**
De læringer og patterns jeg har anvendt i dette projekt (multi-tenancy, role-based access, modular widget systems) er transferable til mange andre SaaS produkter. Erfaringerne vil være værdifulde i min fremtidige karriere som webudvikler.

---

## 13. Litteraturliste

[Følg Harvard eller APA format - vælg én stil og vær konsistent]

### Bøger og akademiske artikler

Chong, F., Carraro, G., & Wolter, R. (2006). _Multi-Tenant Data Architecture_. Microsoft Developer Network. Tilgængelig på: https://docs.microsoft.com/...

[Indsæt dine akademiske kilder her]

### Teknisk dokumentation

Next.js. (2024). _Next.js Documentation_. Vercel. Tilgængelig på: https://nextjs.org/docs [Senest tilgået: 4. december 2025]

React. (2024). _React Documentation_. Meta Open Source. Tilgængelig på: https://react.dev [Senest tilgået: 4. december 2025]

Auth0. (2024). _Auth0 Documentation_. Okta. Tilgængelig på: https://auth0.com/docs [Senest tilgået: 4. december 2025]

Supabase. (2024). _Supabase Documentation_. Supabase Inc. Tilgængelig på: https://supabase.com/docs [Senest tilgået: 4. december 2025]

[Tilføj flere tekniske kilder]

### Web artikler

[Indsæt relevante blog posts, artikler etc.]

---

## 14. Bilag

### Bilag A: Database Diagram

[Indsæt fuld ER-diagram]

### Bilag B: User Flow Diagrammer

[Indsæt detaljerede user flows]

### Bilag C: Kodeeksempler

**C.1 Workspace Layout Implementation**

```typescript
// Full code from app/(dashboard)/[workspaceId]/layout.tsx
[Indsæt fuld kode]
```

**C.2 Widget Implementations**
[Indsæt alle widget komponenter]

**C.3 API Routes**
[Indsæt API endpoint implementations]

### Bilag D: Wireframes og Mockups

[Indsæt alle design files]

### Bilag E: Test Dokumentation

[Indsæt test cases og results]

### Bilag F: Deployment Guide

[Indsæt step-by-step deployment instructions]

### Bilag G: Environment Variables

[Indsæt komplet .env.example med beskrivelser]

---

## Noter til skrivning

**Husk:**

- Max 30 sider (ekskl. forside, indhold, litteratur, bilag)
- 2.400 tegn per normalside
- Stave- og formuleringsevne vægter 10%
- Akademisk tone (tredje person, undgå "jeg" hvor muligt i hovedtekst - OK i refleksion)
- Referer til figurer og bilag korrekt
- Nummerér alle figurer: "Figur 1: Database ER-diagram"
- Citér korrekt (Harvard eller APA)

**Sproglige tips:**

- Vær præcis og konkret
- Undgå buzzwords uden forklaring
- Forklar tekniske termer første gang de bruges
- Brug aktiv form fremfor passiv hvor muligt
- Vær konsistent i termer (workspace vs. arbejdsområde - vælg én)

**Struktur tips:**

- Start hver hovedsektion med kort intro til hvad sektionen dækker
- Afslut hver hovedsektion med kort opsummering
- Brug overskrifter konsistent (samme stil i hele dokumentet)
- Referer back til problemformulering og undersøgelsesspørgsmål løbende
