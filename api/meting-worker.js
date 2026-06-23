/**
 * Meting API Serverless — Cloudflare Workers 版
 * 部署: Cloudflare Dashboard → Workers → 创建 → 粘贴此代码 → 部署
 * 功能: 聚合网易云/QQ/酷狗/酷我/咪咕 5平台搜索+播放URL
 */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const server = url.searchParams.get('server') || 'netease'
  const type = url.searchParams.get('type') || 'search'
  const id = url.searchParams.get('id') || ''

  // CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
      }
    })
  }

  let result = []
  const cache = caches.default
  const cacheKey = url.toString()
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  try {
    if (type === 'search') {
      result = await searchMusic(server, id)
    } else if (type === 'url') {
      result = await getPlayUrl(server, id)
    }
  } catch (e) {
    result = []
  }

  const response = new Response(JSON.stringify(result), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
    }
  })

  event.waitUntil(cache.put(cacheKey, response.clone()))
  return response
}

async function searchMusic(server, keyword) {
  k = encodeURIComponent(keyword)
  switch (server) {
    case 'netease': {
      const r = await fetch(`https://music.163.com/api/search/get?type=1&limit=20&s=${k}`)
      const d = await r.json()
      return (d.result?.songs || []).map(s => ({
        id: s.id, title: s.name, artist: (s.ar||[]).map(a=>a.name).join('/'),
        album: s.al?.name||'', cover: s.al?.picUrl||'', source: 'netease', duration: s.dt||0,
      }))
    }
    case 'tencent': {
      const r = await fetch(`https://c.y.qq.com/soso/fcgi-bin/client_search_cp?format=json&n=20&w=${k}`)
      const d = await r.json()
      return (d.data?.song?.list||[]).map(s => ({
        id: s.songmid, title: s.songname, artist: (s.singer||[]).map(a=>a.name).join('/'),
        album: s.albumname||'', cover: s.albummid?`https://y.gtimg.cn/music/photo_new/T002R300x300M000${s.albummid}.jpg`:'',
        source: 'qq', duration: s.interval||0,
      }))
    }
    case 'kugou': {
      const r = await fetch(`https://songsearch.kugou.com/song_search_v2?keyword=${k}&page=1&pagesize=20`)
      const d = await r.json()
      return (d.data?.lists||[]).map(s => ({
        id: s.FileHash, title: s.SongName, artist: s.SingerName,
        album: s.AlbumName||'', cover: '', source: 'kugou', duration: s.Duration||0,
      }))
    }
    case 'kuwo': {
      const r = await fetch(`https://search.kuwo.cn/r.s?all=${k}&pn=0&rn=20&ft=music&format=json`)
      const d = await r.json()
      return (d.abslist||[]).map(s => ({
        id: s.MUSICRID, title: s.SONGNAME||s.name, artist: s.ARTIST||s.singer,
        album: s.ALBUM||'', cover: '', source: 'kuwo', duration: s.DURATION||0,
      }))
    }
    case 'migu': {
      const r = await fetch(`https://m.music.migu.cn/migu/remoting/scr_search_tag?keyword=${k}&type=2&pgc=1&rows=20`)
      const d = await r.json()
      return ((d.musics||d.songs||[])).map(s => ({
        id: s.id||s.songId, title: s.songName||s.name,
        artist: (s.singerName||s.artist||'').replace(/\|/g,'/'),
        album: s.albumName||s.album||'', cover: s.cover||s.img||'',
        source: 'migu', duration: 0,
      }))
    }
    default: return []
  }
}

async function getPlayUrl(server, id) {
  switch (server) {
    case 'netease': {
      // 网易云播放URL通过专属API获取（cloudMusic-api-enhanced）
      return { url: '', note: 'netease_requires_dedicated_api' }
    }
    case 'tencent': {
      const r = await fetch(`https://u.y.qq.com/cgi-bin/musicu.fcg?data={"req":{"module":"CDN.SrfCdnDispatchServer","method":"GetCdnDispatch","param":{"guid":"0","calltype":0,"userip":""}},"req_0":{"module":"vkey.GetVkey","method":"CgiGetVkey","param":{"guid":"0","songmid":["${id}"],"songtype":[0],"uin":"0","loginflag":1,"platform":"20"}},"comm":{"uin":0,"format":"json","ct":24,"cv":0}}`)
      const d = await r.json()
      const purl = d.req_0?.data?.midurlinfo?.[0]?.purl
      if (purl) return { url: `http://isure.stream.qqmusic.qq.com/${purl}` }
      return { url: '', note: 'qq_vkey_failed' }
    }
    case 'kugou': {
      const r = await fetch(`https://wwwapi.kugou.com/yy/index.php?r=play/getdata&hash=${id}`)
      const d = await r.json()
      return { url: d.data?.play_url||'' }
    }
    default: return { url: '' }
  }
}
