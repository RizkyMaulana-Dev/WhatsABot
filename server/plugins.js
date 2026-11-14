const commands = {
  '.menu': {
    name: 'Menu',
    description: 'Tampilkan daftar perintah',
    category: 'info',
    usage: '.menu',
    execute: async (client, message) => {
      const categories = [...new Set(Object.values(commands).map(c => c.category))];
      let text = '📋 *Daftar Perintah*\n\n';
      categories.forEach(cat => {
        text += `*${cat.toUpperCase()}*\n`;
        Object.entries(commands).forEach(([trigger, cmd]) => {
          if (cmd.category === cat) {
            text += `  ${trigger} - ${cmd.description}\n`;
          }
        });
        text += '\n';
      });
      await client.sendText(message.from, text);
    }
  },
  '.help': {
    name: 'Help',
    description: 'Bantuan penggunaan bot',
    category: 'info',
    usage: '.help [perintah]',
    execute: async (client, message) => {
      const args = message.body.split(' ').slice(1).join(' ');
      if (args && commands[args]) {
        const cmd = commands[args];
        await client.sendText(message.from, `*${cmd.name}*\n${cmd.description}\nUsage: ${cmd.usage}`);
      } else {
        await commands['.menu'].execute(client, message);
      }
    }
  },
  '.stok': {
    name: 'Stok',
    description: 'Cek stok produk',
    category: 'shop',
    usage: '.stok [produk]',
    execute: async (client, message) => {
      const args = message.body.split(' ').slice(1).join(' ');
      const products = {
        'A': { name: 'Produk A', stock: 42, price: 15000 },
        'B': { name: 'Produk B', stock: 18, price: 25000 },
        'C': { name: 'Produk C', stock: 0, price: 30000 }
      };
      if (args && products[args.toUpperCase()]) {
        const p = products[args.toUpperCase()];
        await client.sendText(message.from, `📦 *${p.name}*\nStok: ${p.stock} unit\nHarga: Rp${p.price.toLocaleString()}`);
      } else {
        let text = '📦 *Stok Produk*\n\n';
        Object.entries(products).forEach(([key, p]) => {
          text += `${key}. ${p.name}: ${p.stock} unit (Rp${p.price.toLocaleString()})\n`;
        });
        await client.sendText(message.from, text);
      }
    }
  },
  '.ask': {
    name: 'Tanya AI',
    description: 'Tanyakan apapun ke AI',
    category: 'ai',
    usage: '.ask [pertanyaan]',
    execute: async (client, message) => {
      const question = message.body.split(' ').slice(1).join(' ');
      if (!question) {
        await client.sendText(message.from, '❓ Silakan ajukan pertanyaan: *.ask [pertanyaan]*');
        return;
      }
      // Simulated AI response
      const responses = [
        `🤖 AI: Terima kasih atas pertanyaan "${question}". Ini adalah jawaban simulasi.`,
        `🤖 AI: Mengenai "${question}", saya masih belajar. Coba tanyakan hal lain!`,
        `🤖 AI: Jawaban untuk "${question}" akan segera hadir.`
      ];
      await client.sendText(message.from, responses[Math.floor(Math.random() * responses.length)]);
    }
  },
  '.sticker': {
    name: 'Stiker',
    description: 'Buat stiker dari gambar',
    category: 'media',
    usage: '.sticker (reply to image)',
    execute: async (client, message) => {
      if (!message.quotedMsg || !['image', 'video', 'gif'].includes(message.quotedMsg.type)) {
        await client.sendText(message.from, '📷 Reply gambar/video/gif dengan *.sticker* untuk membuat stiker');
        return;
      }
      await client.sendImageAsSticker(message.from, await client.decryptFile(message.quotedMsg));
    }
  }
};

module.exports = { commands };