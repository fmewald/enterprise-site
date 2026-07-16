#!/usr/bin/env node
/**
 * Regenera posts/index.json a partir dos arquivos .md em /posts.
 * Roda automaticamente na Netlify a cada publicação. Ninguém edita isto à mão.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'posts');

function parseFrontMatter(txt) {
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const meta = {};
  if (m) {
    m[1].split(/\r?\n/).forEach((linha) => {
      const idx = linha.indexOf(':');
      if (idx > -1) {
        const k = linha.slice(0, idx).trim();
        const v = linha.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        meta[k] = v;
      }
    });
  }
  return meta;
}

const posts = fs.readdirSync(DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const slug = f.replace(/\.md$/, '');
    const meta = parseFrontMatter(fs.readFileSync(path.join(DIR, f), 'utf-8'));
    return {
      slug,
      titulo: meta.titulo || slug,
      resumo: meta.resumo || '',
      categoria: meta.categoria || 'Artigo',
      capa: meta.capa || '',
      data: meta.data || ''
    };
  })
  .sort((a, b) => (b.data || '').localeCompare(a.data || ''));

fs.writeFileSync(path.join(DIR, 'index.json'), JSON.stringify(posts, null, 2) + '\n');
console.log('index.json regenerado com ' + posts.length + ' artigo(s).');
