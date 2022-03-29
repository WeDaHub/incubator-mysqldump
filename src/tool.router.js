import Vue from 'vue'
import Router from 'vue-router'
import {stat} from "./helper";

Vue.use(Router);

// 路由配置
const routes = [
        {
        path: "/tool/mysqldump",
        component: r => require(['./views/tool/mysqldump.vue'], r)
    },
    {
        path: "/tool/dbinsert",
        component: r => require(['./views/tool/dbinsert.vue'], r)
    }
];

const router = new Router({routes});

stat('index');

router.afterEach(to => {
    stat('tool', {tool: to.path})
});

export default router
