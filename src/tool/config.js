import {env, inArray} from "../helper";
import cache from "./cache";
import { Base64 } from 'js-base64';


// 工具缓存数据过期时间(秒)
export const TOOL_DATA_EXPIRY = 1800;
// 徽章过期时间(天)
export const BADGE_EXPIRY = 10;
// 分类徽章
export const BADGE_CATEGORY = ["open"];
// 工具徽章
export const BADGE_TOOL = ["reallog"];
// 默认常用工具
export const DEFAULT_COMMON_TOOL = [
    "mysqldump","dbinsert"
];

const category = [
    {"name": "mysql","title": "MySQL"},
];



const tool = [
    {"name": "mysqldump", "title": "mysqldump", cat: ["mysql"] },
    {"name": "dbinsert", "title": "dbinsert", cat: ["mysql"] },
];

// 徽章是否显示
const badgeIsShow = function () {
    return (Date.parse((new Date()).toString()) / 1000) - env('updateTime') < BADGE_EXPIRY * 86400
};

const getUserCommon = function () {
    let tools = cache.getNoVersion('user_common');
    return tools ? tools : DEFAULT_COMMON_TOOL;
};

const setUserCommon = function (tools) {
    cache.setnNoVersion('user_common', tools);
};

export default {
    tool,
    category,
    setUserCommon,
    open_tools_env,
    getToolByCategory(cat) {
        return tool.filter((t) => {
            if (cat === "common") {
                return inArray(t.name, getUserCommon())
            }
            return inArray(cat, t.cat)
        });
    },
    badgeToolIsShow(tool) {
        return badgeIsShow() && inArray(tool, BADGE_TOOL);
    },
    badgeCategoryIsShow(cat) {
        return badgeIsShow() && inArray(cat, BADGE_CATEGORY);
    },
    getOpenToolsEnv(){
        return open_tools_env;
    },
}
