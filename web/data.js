const data = {
  lang: 'id',
  onboardingComplete: false,
  plan: 'free',
  botStatus: 'active',
  batteryPercent: 78,
  batteryEstimateHours: 5,
  temperatureC: 38,
  recentMessages: [
    {
      id: 'msg1',
      timestamp: '10:45',
      sender: '+62 812-3456-7890',
      preview: 'Halo, apakah stok produk A tersedia?'
    },
    {
      id: 'msg2',
      timestamp: '10:42',
      sender: '+62 812-3456-7890',
      preview: 'Halo, apakah Anda bisa membantu saya?'
    },
    {
      id: 'msg3',
      timestamp: '10:38',
      sender: '+62 812-3456-7890',
      preview: 'Terima kasih atas informasinya.'
    }
  ],
  connectionStatus: 'connected',
  phoneNumber: '+62 812-3456-7890',
  pairingCode: 'ABCD-1234',
  plugins: [
    {
      id: 'sticker',
      name: 'Sticker Maker',
      description: 'Buat stiker kustom dari gambar atau teks.',
      category: 'Sticker',
      isOfficial: true,
      installed: true,
      enabled: true,
      hasUpdate: false,
      version: '1.2.0',
      changelog: 'Perbaikan performa dan peningkatan kualitas gambar.',
      permissions: ['Read incoming messages', 'Send media'],
      commands: [
        {
          trigger: '.sticker',
          description: 'Buat stiker dari gambar atau teks'
        }
      ]
    },
    {
      id: 'ai',
      name: 'AI Assistant',
      description: 'Asisten AI untuk menjawab pertanyaan umum.',
      category: 'AI',
      isOfficial: true,
      installed: true,
      enabled: true,
      hasUpdate: true,
      version: '2.1.0',
      changelog: 'Penambahan dukungan untuk bahasa Indonesia.',
      permissions: ['Read incoming messages', 'Send messages'],
      commands: [
        {
          trigger: '.ask',
          description: 'Tanyakan sesuatu kepada AI'
        }
      ]
    },
    {
      id: 'commerce',
      name: 'Store Catalog',
      description: 'Kelola katalog produk Anda.',
      category: 'Commerce',
      isOfficial: true,
      installed: true,
      enabled: true,
      hasUpdate: false,
      version: '1.0.0',
      changelog: 'Rilis awal.',
      permissions: ['Read incoming messages', 'Send messages'],
      commands: [
        {
          trigger: '.menu',
          description: 'Tampilkan menu produk'
        },
        {
          trigger: '.stok',
          description: 'Periksa stok produk'
        }
      ]
    },
    {
      id: 'utility',
      name: 'Utility Tools',
      description: 'Alat utilitas untuk berbagai kebutuhan.',
      category: 'Utility',
      isOfficial: false,
      installed: true,
      enabled: true,
      hasUpdate: false,
      version: '0.9.0',
      changelog: 'Perbaikan bug kecil.',
      permissions: ['Read incoming messages'],
      commands: [
        {
          trigger: '.help',
          description: 'Tampilkan bantuan'
        }
      ]
    },
    {
      id: 'news',
      name: 'News Fetcher',
      description: 'Ambil berita terbaru.',
      category: 'Utility',
      isOfficial: false,
      installed: false,
      enabled: false,
      hasUpdate: false,
      version: '1.0.0',
      changelog: 'Rilis awal.',
      permissions: ['Send messages'],
      commands: [
        {
          trigger: '.news',
          description: 'Ambil berita terbaru'
        }
      ]
    },
    {
      id: 'weather',
      name: 'Weather Forecast',
      description: 'Perkiraan cuaca untuk lokasi Anda.',
      category: 'Utility',
      isOfficial: false,
      installed: false,
      enabled: false,
      hasUpdate: false,
      version: '1.0.0',
      changelog: 'Rilis awal.',
      permissions: ['Send messages'],
      commands: [
        {
          trigger: '.weather',
          description: 'Perkiraan cuaca'
        }
      ]
    }
  ],
  updates: [
    {
      id: 'app',
      name: 'App Shell',
      version: '1.0.1',
      mandatory: true
    },
    {
      id: 'core',
      name: 'Bot Core',
      version: '2.3.0',
      mandatory: false
    },
    {
      id: 'sticker',
      name: 'Sticker Maker',
      version: '1.2.1',
      mandatory: false
    }
  ],
  updatePolicy: {
    channel: 'stable',
    autoUpdatePlugins: true,
    wifiOnly: false
  },
  foregroundServiceRunning: true,
  ramUsageMb: 142,
  diagnosticLogs: [
    '2023-11-15 10:30:00 - INFO - Bot started',
    '2023-11-15 10:31:15 - INFO - Connected to WhatsApp',
    '2023-11-15 10:32:45 - INFO - Sticker Maker plugin loaded',
    '2023-11-15 10:33:30 - INFO - AI Assistant plugin loaded',
    '2023-11-15 10:34:15 - INFO - Store Catalog plugin loaded'
  ]
};

const translations = {
  id: {
    home: 'Beranda',
    connection: 'Koneksi',
    plugins: 'Plugin',
    commands: 'Perintah',
    settings: 'Pengaturan',
    botStatus: 'Status Bot',
    active: 'Aktif',
    paused: 'Dijeda',
    stopped: 'Berhenti',
    startBot: 'Mulai Bot',
    stopBot: 'Hentikan Bot',
    pauseTemporarily: 'Jeda Sementara',
    runtimeHealth: 'Kesehatan Runtime',
    battery: 'Baterai',
    thermal: 'Thermal',
    remaining: 'tersisa',
    recentActivity: 'Aktivitas Terbaru',
    connectionStatus: 'Status Koneksi',
    connected: 'Terhubung',
    disconnected: 'Terputus',
    pairingCode: 'Kode Pairing',
    copy: 'Salin',
    copied: 'Tersalin',
    requestNewCode: 'Minta Kode Baru',
    pairingGuide: 'Petunjuk Pairing',
    disconnectSession: 'Putuskan Sesi',
    explore: 'Jelajahi',
    installed: 'Terpasang',
    official: 'Resmi',
    permissions: 'Izin',
    version: 'Versi',
    update: 'Perbarui',
    install: 'Pasang',
    uninstall: 'Copot',
    enable: 'Aktifkan',
    disable: 'Nonaktifkan',
    searchCommands: 'Cari perintah...',
    updateCenter: 'Pusat Pembaruan',
    updatePolicy: 'Kebijakan Pembaruan',
    diagnostics: 'Diagnostik',
    planManagement: 'Manajemen Plan',
    mandatory: 'Wajib',
    recommended: 'Disarankan',
    stable: 'Stabil',
    beta: 'Beta',
    autoUpdatePlugins: 'Perbarui plugin secara otomatis',
    wifiOnly: 'Hanya Wi-Fi',
    foregroundService: 'Layanan Latar Belakang',
    running: 'Berjalan',
    stopped: 'Berhenti',
    ramUsage: 'Penggunaan RAM',
    exportLogs: 'Ekspor Log',
    logsExported: 'Log Diekspor',
    plan: 'Plan',
    free: 'Gratis',
    starter: 'Pemula',
    localRuntime: 'Runtime Lokal',
    cloudRuntime: 'Runtime Awan',
    upgrade: 'Tingkatkan',
    switchPlan: 'Ganti Plan',
    replayOnboarding: 'Ulangi Onboarding',
    back: 'Kembali', next: 'Lanjut', finish: 'Selesai', close: 'Tutup',
    select: 'Pilih', current: 'Saat ini', cancel: 'Batal',
    onboardTitles: ['Pilih Plan', 'Izinkan Akses', 'Hubungkan WhatsApp'],
    onboardSubs: ['Pilih cara menjalankan bot Anda', 'Bot memerlukan beberapa izin untuk berjalan dengan baik', 'Ikuti langkah-langkah di bawah untuk menghubungkan WhatsApp'],
    warm: 'Hangat', normal: 'Normal', hot: 'Panas',
    updated: 'Diperbarui', upToDate: 'Terbaru', uninstalled: 'Dilepas', installedDone: 'Terpasang',
    enabledOn: 'Aktif', enabledOff: 'Nonaktif', on: 'Ya', off: 'Tidak',
    noPlugins: 'Belum ada plugin terpasang',
    changelog: 'Catatan Perubahan'
  },
  en: {
    home: 'Home',
    connection: 'Connection',
    plugins: 'Plugins',
    commands: 'Commands',
    settings: 'Settings',
    botStatus: 'Bot Status',
    active: 'Active',
    paused: 'Paused',
    stopped: 'Stopped',
    startBot: 'Start Bot',
    stopBot: 'Stop Bot',
    pauseTemporarily: 'Pause Temporarily',
    runtimeHealth: 'Runtime Health',
    battery: 'Battery',
    thermal: 'Thermal',
    remaining: 'remaining',
    recentActivity: 'Recent Activity',
    connectionStatus: 'Connection Status',
    connected: 'Connected',
    disconnected: 'Disconnected',
    pairingCode: 'Pairing Code',
    copy: 'Copy',
    copied: 'Copied',
    requestNewCode: 'Request New Code',
    pairingGuide: 'Pairing Guide',
    disconnectSession: 'Disconnect Session',
    explore: 'Explore',
    installed: 'Installed',
    official: 'Official',
    permissions: 'Permissions',
    version: 'Version',
    update: 'Update',
    install: 'Install',
    uninstall: 'Uninstall',
    enable: 'Enable',
    disable: 'Disable',
    searchCommands: 'Search commands...',
    updateCenter: 'Update Center',
    updatePolicy: 'Update Policy',
    diagnostics: 'Diagnostics',
    planManagement: 'Plan Management',
    mandatory: 'Mandatory',
    recommended: 'Recommended',
    stable: 'Stable',
    beta: 'Beta',
    autoUpdatePlugins: 'Auto-update plugins',
    wifiOnly: 'Wi-Fi only',
    foregroundService: 'Foreground Service',
    running: 'Running',
    stopped: 'Stopped',
    ramUsage: 'RAM Usage',
    exportLogs: 'Export Logs',
    logsExported: 'Logs Exported',
    plan: 'Plan',
    free: 'Free',
    starter: 'Starter',
    localRuntime: 'Local Runtime',
    cloudRuntime: 'Cloud Runtime',
    upgrade: 'Upgrade',
    switchPlan: 'Switch Plan',
    replayOnboarding: 'Replay Onboarding',
    back: 'Back', next: 'Next', finish: 'Finish', close: 'Close',
    select: 'Select', current: 'Current', cancel: 'Cancel',
    onboardTitles: ['Choose a Plan', 'Allow Access', 'Link WhatsApp'],
    onboardSubs: ['Choose how your bot runs', 'The bot needs a few permissions to run smoothly', 'Follow the steps below to link WhatsApp'],
    warm: 'Warm', normal: 'Normal', hot: 'Hot',
    updated: 'Updated', upToDate: 'Up to date', uninstalled: 'Uninstalled', installedDone: 'Installed',
    enabledOn: 'On', enabledOff: 'Off', on: 'On', off: 'Off',
    noPlugins: 'No plugins installed yet',
    changelog: 'Changelog'
  }
};
