import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 反向代理配置 - 可解决跨域问题
  /* 因为我们给url加上了前缀/api，我们访问/movie/top250就当于访问了：
  localhost:8080/api/movie/top250（其中localhost:8080是默认的IP和端口）。
      在index.js中的proxyTable中拦截了/api,并把/api及其前面的
      所有替换成了target中的内容，因此实际访问Url是http://api.douban.com/v2/movie/top250。 */
  server: {
    hmr: true,
    port: 3004,
    proxy: {
      "/api": {
        target: "http://localhost:7070",// 你请求的第三方接口
        changeOrigin: true,// 在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求的数据，这样服务端和服务端进行数据的交互就不会有跨域问题
        pathRewrite: {// 路径重写
          "^api": "/api"// 替换target中的请求地址，也就是说以后你在请求http://api.douban.com/v2/XXXXX这个地址的时候直接写成/api即可。
        }
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    },
    chunkFileNames: (chunkInfo) => {
      const facadeModuleId = chunkInfo.facadeModuleId
        ? chunkInfo.facadeModuleId.split('/')
        : [];
      const fileName =
        facadeModuleId[facadeModuleId.length - 2] || '[name]';
      return `js/${fileName}/[name].[hash].js`;
    }
  }
})
