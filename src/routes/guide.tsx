import { createFileRoute } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { Info, LayoutDashboard, Settings, Wallet } from "lucide-react"

export const Route = createFileRoute("/guide")({
  component: GuidePage
})

function GuidePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex items-start gap-3">
        <div className="mt-1 rounded-md border border-border/60 bg-background/40 p-2 text-sky-400">
          <Info className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">
            Panduan Singkat MyPocket CFO
          </h1>
          <p className="text-sm text-mutedForeground">
            Halaman ini menjelaskan cara memakai MyPocket CFO dari nol, dalam
            bahasa santai.
          </p>
        </div>
      </header>

      <Section title="1. Konsep dasar" icon={<LayoutDashboard className="h-4 w-4" />}>
        <ul className="list-disc space-y-1 pl-5 text-sm text-mutedForeground">
          <li>
            <strong>Dashboard</strong>: ringkasan keuangan kamu (pemasukan, pengeluaran,
            net balance, grafik tren, dan ringkasan transaksi/pocket).
          </li>
          <li>
            <strong>Pockets</strong>: kantong-kantong uang (misalnya: Daily, Bills,
            Liburan) untuk membagi budget.
          </li>
          <li>
            <strong>Settings</strong>: atur mata uang, mode privasi, fitur pintar, dan
            koneksi ke AI agent lokal kamu.
          </li>
          <li>
            <strong>Smart Input &quot;Tanya CFO&quot;</strong>: cara tercepat input transaksi
            dan nanya hal-hal keuangan dengan bahasa sehari-hari.
          </li>
        </ul>
      </Section>

      <Section title="2. Navigasi & sidebar" icon={<LayoutDashboard className="h-4 w-4" />}>
        <ul className="list-disc space-y-1 pl-5 text-sm text-mutedForeground">
          <li>
            Di kiri ada <strong>sidebar</strong> dengan menu: Dashboard, Pockets, Settings.
          </li>
          <li>
            Sidebar bisa <strong>collapse / expand</strong> pakai tombol di header (ikon
            panel) di sebelah kiri teks &quot;MyPocket CFO&quot;.
          </li>
          <li>
            Di Settings, kamu bisa pilih apakah sidebar yang sedang collapse akan
            <strong> otomatis melebar saat di-hover</strong> atau tidak.
          </li>
          <li>
            Di mobile, pakai <strong>ikon hamburger</strong> di kiri atas untuk membuka
            menu, dan ikon <strong>X</strong> untuk menutupnya.
          </li>
        </ul>
      </Section>

      <Section title="3. Memakai Dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
        <Subsection title="3.1 Kartu ringkasan di atas">
          <ul className="list-disc space-y-1 pl-5 text-sm text-mutedForeground">
            <li>
              <strong>Total Pemasukan</strong>: jumlah semua transaksi bertipe income.
            </li>
            <li>
              <strong>Total Pengeluaran</strong>: jumlah semua transaksi bertipe expense.
            </li>
            <li>
              <strong>Net Balance</strong>: pemasukan dikurangi pengeluaran.
            </li>
            <li>
              Aktifkan <strong>Privacy Mode</strong> di Settings kalau kamu ingin angka ini
              di-blur (aman kalau presentasi / screen share).
            </li>
          </ul>
        </Subsection>

        <Subsection title="3.2 Grafik tren pengeluaran">
          <p className="text-sm text-mutedForeground">
            Bagian &quot;Monthly Expense Trend&quot; menunjukkan total pengeluaran per bulan
            (6 bulan terakhir). Pola naik-turun di sini membantu kamu lihat bulan mana
            yang &quot;boros&quot;.
          </p>
        </Subsection>

        <Subsection title="3.3 Smart Input transaksi">
          <ul className="list-disc space-y-1 pl-5 text-sm text-mutedForeground">
            <li>
              Di bagian &quot;Smart Input&quot; kamu bisa ketik transaksi pakai bahasa bebas,
              contoh:
              <br />
              <code className="mt-1 inline-block rounded bg-card/80 px-2 py-1 text-xs">
                nambah jajan kopi 25rb di starbucks
              </code>
            </li>
            <li>
              Pilih <strong>Pocket</strong> (opsional) dan <strong>tanggal</strong> kalau
              mau spesifik.
            </li>
            <li>
              Klik <strong>&quot;Simpan transaksi&quot;</strong>. Sistem akan mencoba menebak:
              tipe (income/expense), nominal, dan kategori.
            </li>
            <li>
              Fitur ini bisa dinyalakan/dimatikan auto-kategorinya lewat
              <strong> Smart Categorization</strong> di Settings.
            </li>
          </ul>
        </Subsection>

        <Subsection title="3.4 Tanya CFO (AI)">
          <ul className="list-disc space-y-1 pl-5 text-sm text-mutedForeground">
            <li>
              Di bagian &quot;Ask Your CFO&quot; kamu bisa nanya seputar keuangan, misalnya:
              <br />
              <code className="mt-1 inline-block rounded bg-card/80 px-2 py-1 text-xs">
                Berapa total jajan bulan lalu?
              </code>
            </li>
            <li>
              Pertanyaan tertentu (seperti contoh di atas) dijawab secara
              <strong> rule-based</strong> langsung dari data transaksi kamu.
            </li>
            <li>
              Jika tidak ada rule yang cocok, barulah pertanyaan dilempar ke
              <strong> AI agent</strong> (kalau kamu sudah mengatur endpoint di Settings),
              atau ke jawaban lokal placeholder bila belum.
            </li>
          </ul>
        </Subsection>
      </Section>

      <Section title="4. Mengatur Pockets" icon={<Wallet className="h-4 w-4" />}>
        <Subsection title="4.1 Membuat pocket baru">
          <ul className="list-disc space-y-1 pl-5 text-sm text-mutedForeground">
            <li>Buka menu <strong>Pockets</strong>.</li>
            <li>
              Isi <strong>Nama pocket</strong> (mis. &quot;Daily&quot;, &quot;Bills&quot;,
              &quot;Liburan Jepang&quot;).
            </li>
            <li>
              Isi <strong>Limit</strong> (opsional) jika ingin ada batas budget.
            </li>
            <li>
              Pilih tipe:
              <ul className="list-disc pl-5">
                <li>
                  <strong>Project / Goal</strong>: cocok untuk satu tujuan (contoh:
                  Liburan, Beli Gadget).
                </li>
                <li>
                  <strong>Recurring (Monthly)</strong>: cocok untuk checklist bulanan
                  (contoh: langganan, tagihan rutin).
                </li>
              </ul>
            </li>
            <li>
              Untuk tipe Recurring, pilih juga <strong>reset day</strong> (tanggal berapa
              checklist di-reset tiap bulan).
            </li>
            <li>Klik &quot;Buat Pocket&quot; untuk menyimpan.</li>
          </ul>
        </Subsection>

        <Subsection title="4.2 Melihat dan mengelola semua pocket">
          <ul className="list-disc space-y-1 pl-5 text-sm text-mutedForeground">
            <li>
              Di bawah form, bagian &quot;All Pockets&quot; menampilkan semua pocket aktif
              lengkap dengan <strong>progress bar</strong>.
            </li>
            <li>
              Untuk pocket recurring, kamu bisa menambah item checklist dan centang
              ketika selesai.
            </li>
            <li>
              Untuk pocket project/goal, progress diambil dari total pengeluaran
              dibanding limit yang kamu tetapkan.
            </li>
            <li>
              Jika goal tercapai atau pocket sudah tidak dipakai, gunakan tombol
              <strong> Archive</strong> untuk menyembunyikannya dari daftar aktif.
            </li>
          </ul>
        </Subsection>
      </Section>

      <Section title="5. Settings & AI agent lokal" icon={<Settings className="h-4 w-4" />}>
        <Subsection title="5.1 Pengaturan umum">
          <ul className="list-disc space-y-1 pl-5 text-sm text-mutedForeground">
            <li>
              Atur <strong>nama profil</strong> dan <strong>email</strong> (opsional) untuk
              personalisasi.
            </li>
            <li>
              Pilih <strong>mata uang</strong>: IDR atau USD (mempengaruhi format tampilan
              angka).
            </li>
            <li>
              Atur <strong>Sidebar hover expand</strong>:
              <ul className="list-disc pl-5">
                <li>
                  Jika aktif: saat sidebar collapse, ia akan melebar sementara ketika
                  di-hover.
                </li>
                <li>
                  Jika nonaktif: sidebar hanya berubah lewat tombol toggle di header.
                </li>
              </ul>
            </li>
          </ul>
        </Subsection>

        <Subsection title="5.2 Fitur pintar & Privacy">
          <ul className="list-disc space-y-1 pl-5 text-sm text-mutedForeground">
            <li>
              <strong>RAG AI Analysis</strong>: mengontrol apakah widget &quot;Ask Your
              CFO&quot; muncul dan siap terhubung ke AI agent.
            </li>
            <li>
              <strong>Smart Categorization</strong>: jika aktif, Smart Input akan
              mencoba mengisi kategori otomatis dari teks.
            </li>
            <li>
              <strong>Privacy Mode</strong>: jika aktif, angka sensitif di dashboard akan
              di-blur.
            </li>
          </ul>
        </Subsection>

        <Subsection title="5.3 Menghubungkan AI agent lokal">
          <ul className="list-disc space-y-1 pl-5 text-sm text-mutedForeground">
            <li>
              Jalankan AI agent kamu (misalnya Ollama atau service Transformers.js) di
              localhost dengan endpoint HTTP yang menerima:
              <code className="mt-1 block rounded bg-card/80 px-2 py-1 text-xs">
                POST /your-endpoint
                <br />
                &#123; &quot;prompt&quot;: &quot;teks prompt...&quot; &#125;
              </code>
            </li>
            <li>
              Di Settings, isi <strong>AI agent endpoint</strong> (contoh:
              <code className="ml-1 rounded bg-card/80 px-2 py-0.5 text-xs">
                http://localhost:3000/api/ai
              </code>
              ).
            </li>
            <li>
              (Opsional) Atur <strong>AI system prompt</strong> untuk mengarahkan gaya
              bicara dan fokus AI (misalnya lebih fokus ke cashflow pribadi).
            </li>
            <li>
              Sekarang ketika kamu memakai &quot;Ask Your CFO&quot;, pertanyaan yang tidak
              tertangani rule-based akan dikirim ke endpoint ini.
            </li>
          </ul>
        </Subsection>
      </Section>
    </div>
  )
}

function Section({
  title,
  icon,
  children
}: {
  title: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-border/60 bg-card/40 p-4 shadow-sm shadow-sky-500/5">
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-md border border-border/60 bg-background/40 p-1.5 text-sky-400">
          {icon}
        </div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="space-y-3 text-sm">{children}</div>
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-mutedForeground">
        {title}
      </h3>
      <div>{children}</div>
    </div>
  )
}

