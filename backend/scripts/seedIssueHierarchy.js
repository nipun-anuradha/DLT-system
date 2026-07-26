const { sequelize } = require('../config/db');
const { IssueCategory, IssueSubCategory, IssueDetail } = require('../models/associations');

const categories = [
  { name: 'Software', slug: 'software', icon: 'apps', description: 'Office apps, login issues, or software problems' },
  { name: 'Hardware', slug: 'hardware', icon: 'devices', description: 'Laptop, printer, monitor, or device issues' },
  { name: 'System', slug: 'system', icon: 'desktop_windows', description: 'Account access, system setup, or platform problems' },
  { name: 'Internet', slug: 'internet', icon: 'wifi', description: 'Connection, slow network, or VPN problems' },
  { name: 'Request', slug: 'request', icon: 'shopping_cart', description: 'Equipment, access, or service requests' }
];

const subCategories = {
  software: [
    ['Excel', 'excel'],
    ['Outlook', 'outlook'],
    ['Word', 'word'],
    ['Teams', 'teams'],
    ['Other app', 'other-app']
  ],
  hardware: [
    ['Laptop', 'laptop'],
    ['Printer', 'printer'],
    ['Monitor', 'monitor'],
    ['Keyboard / Mouse', 'keyboard-mouse'],
    ['Other device', 'other-device']
  ],
  system: [
    ['Login / Sign-in', 'login-signin'],
    ['Account access', 'account-access'],
    ['System setup', 'system-setup'],
    ['Other system issue', 'other-system-issue']
  ],
  internet: [
    ['Connection issue', 'connection-issue'],
    ['Slow speed', 'slow-speed'],
    ['VPN', 'vpn'],
    ['Other network issue', 'other-network-issue']
  ],
  request: [
    ['Access request', 'access-request'],
    ['Equipment request', 'equipment-request'],
    ['Software request', 'software-request'],
    ['Other request', 'other-request']
  ]
};

const detailsBySubCategory = {
  'software/excel': [
    ['Not opening', 'not-opening'],
    ['Crashes', 'crashes'],
    ['Needs update', 'needs-update']
  ],
  'software/outlook': [
    ['Cannot send', 'cannot-send'],
    ['Mailbox issue', 'mailbox-issue'],
    ['Sync problem', 'sync-problem']
  ],
  'software/word': [
    ['Not responding', 'not-responding'],
    ['Formatting issue', 'formatting-issue'],
    ['Save problem', 'save-problem']
  ],
  'software/teams': [
    ['Audio issue', 'audio-issue'],
    ['Video issue', 'video-issue'],
    ['Login issue', 'login-issue']
  ],
  'software/other-app': [
    ['Installation issue', 'installation-issue'],
    ['Permission issue', 'permission-issue'],
    ['Version issue', 'version-issue']
  ],
  'hardware/laptop': [
    ['Battery issue', 'battery-issue'],
    ['Overheating', 'overheating'],
    ['Keyboard not working', 'keyboard-not-working']
  ],
  'hardware/printer': [
    ['Paper jam', 'paper-jam'],
    ['No print', 'no-print'],
    ['Connection error', 'connection-error']
  ],
  'hardware/monitor': [
    ['No display', 'no-display'],
    ['Flickering', 'flickering'],
    ['Wrong resolution', 'wrong-resolution']
  ],
  'hardware/keyboard-mouse': [
    ['Buttons not working', 'buttons-not-working'],
    ['Connection issue', 'connection-issue'],
    ['Lagging', 'lagging']
  ],
  'hardware/other-device': [
    ['Power issue', 'power-issue'],
    ['Hardware fault', 'hardware-fault'],
    ['Needs replacement', 'needs-replacement']
  ],
  'system/login-signin': [
    ['Password reset', 'password-reset'],
    ['2FA issue', 'two-fa-issue'],
    ['Account locked', 'account-locked']
  ],
  'system/account-access': [
    ['No permission', 'no-permission'],
    ['Access expired', 'access-expired'],
    ['Wrong role', 'wrong-role']
  ],
  'system/system-setup': [
    ['Config issue', 'config-issue'],
    ['Missing software', 'missing-software'],
    ['Wrong settings', 'wrong-settings']
  ],
  'system/other-system-issue': [
    ['System error', 'system-error'],
    ['Unexpected crash', 'unexpected-crash'],
    ['Slow response', 'slow-response']
  ],
  'internet/connection-issue': [
    ['No connection', 'no-connection'],
    ['Intermittent connection', 'intermittent-connection'],
    ['Router issue', 'router-issue']
  ],
  'internet/slow-speed': [
    ['Very slow', 'very-slow'],
    ['Bandwidth issue', 'bandwidth-issue'],
    ['Latency issue', 'latency-issue']
  ],
  'internet/vpn': [
    ['Cannot connect', 'cannot-connect'],
    ['Disconnects often', 'disconnects-often'],
    ['Authentication failed', 'authentication-failed']
  ],
  'internet/other-network-issue': [
    ['DNS issue', 'dns-issue'],
    ['Firewall issue', 'firewall-issue'],
    ['Signal weak', 'signal-weak']
  ],
  'request/access-request': [
    ['New access', 'new-access'],
    ['Temporary access', 'temporary-access'],
    ['Role change', 'role-change']
  ],
  'request/equipment-request': [
    ['Laptop replacement', 'laptop-replacement'],
    ['Monitor upgrade', 'monitor-upgrade'],
    ['Peripheral request', 'peripheral-request']
  ],
  'request/software-request': [
    ['License needed', 'license-needed'],
    ['New app needed', 'new-app-needed'],
    ['Upgrade needed', 'upgrade-needed']
  ],
  'request/other-request': [
    ['Service request', 'service-request'],
    ['Follow-up needed', 'follow-up-needed'],
    ['Clarification needed', 'clarification-needed']
  ]
};

(async () => {
  try {
    await sequelize.sync({ alter: true });

    for (const category of categories) {
      const [createdCategory] = await IssueCategory.findOrCreate({
        where: { slug: category.slug },
        defaults: category
      });

      for (const [name, slug] of subCategories[category.slug] || []) {
        const [createdSubCategory] = await IssueSubCategory.findOrCreate({
          where: { category_id: createdCategory.id, slug },
          defaults: { category_id: createdCategory.id, name, slug }
        });

        const key = `${category.slug}/${slug}`;
        const detailList = detailsBySubCategory[key] || [];

        for (const [detailName, detailSlug] of detailList) {
          await IssueDetail.findOrCreate({
            where: { sub_category_id: createdSubCategory.id, slug: detailSlug },
            defaults: { sub_category_id: createdSubCategory.id, name: detailName, slug: detailSlug }
          });
        }
      }
    }

    console.log('Issue hierarchy seeded with unique third-step options');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed issue hierarchy:', error);
    process.exit(1);
  }
})();
