import { getChannesFromCountryAPI } from "./api.js"

function requestRenderSVGContect(type) {
    return (type === "fill") ? "M5.83,21l1.63-7.03L2,9.25L9.2,8.63L12,2l2.8,6.63L22,9.25l-5.45,4.72L18.18,21L12,17.27L5.83,21Z" : "M8.85,16.83L12,14.93l3.15,1.93l-0.82-3.6l2.78-2.4l-3.65-0.33L12,7.13L10.55,10.5L6.9,10.83l2.78,2.43L8.85,16.83ZM5.83,21l1.63-7.03L2,9.25L9.2,8.63L12,2l2.8,6.63L22,9.25l-5.45,4.72L18.18,21L12,17.27L5.83,21ZM12,12.25Z"
}

export function requestRenderChannels(data) {
    return `
        <li id="${data.id}" data-channel="${data.name}">
            <div data-active="false" onclick="this.dataset.active = this.dataset.active === 'true' ? 'false' : 'true'" class="flex items-center gap-4 bg-black/40 hover:bg-black/20 data-[active=true]:bg-gray-500 px-2 py-1 transition-colors rounded-md cursor-pointer">
                <img class="h-13" src="assets/images/preview.png" alt="channel-logo">

                <svg class="${data.isFavorite ? "hover:fill-gray-600" : "hover:fill-amber-300"}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24px" width="24px" fill="${data.isFavorite ? "#FFD414" : "#FFFFFF"}"><path d="${requestRenderSVGContect(data.isFavorite ? "fill" : false)}"/></svg>

                <p class="text-white font-semibold">${data.channelNumber}</p>
                <p class="text-white font-semibold">${data.name}</p>
            </div>
        </li>
    `
}

export async function loadDefaultChannelSteram() {

    const DEFAULT_COUNTRY = "MA";
    const DEFAULT_CHANNELID = 2;

    const list_channels = document.getElementById("list-channels");
    if (!list_channels) return false;

    const channels = await getChannesFromCountryAPI();
    if (!channels) return false;

    list_channels.innerHTML = "";

    const result = channels.filter(code => { return code.countryCode === DEFAULT_COUNTRY })
    result.forEach(data => list_channels.innerHTML += requestRenderChannels(data))

    const selectedChannelObject = channels.filter(channel => { return Number(channel.id) === DEFAULT_CHANNELID });
    if (!selectedChannelObject) return false;

    const streamUrl = selectedChannelObject[0].streamUrl;
    if (!streamUrl) return false;

    const channel_preview = document.getElementById("channel-preview");

    if (Hls.isSupported()) {
        let hlsElement = new Hls();
        hlsElement.loadSource(streamUrl);
        hlsElement.attachMedia(channel_preview);
        hlsElement.on(Hls.Events.MANIFEST_PARSED, () => {
            
            channel_preview.play();

            const home_loading = document.getElementById("home-loading");
            if (!home_loading) return false;
            home_loading.classList.add("hidden");

            const main_section = document.getElementById("main-section");
            if (!main_section) return false;
            main_section.classList.remove("blur-md");

        });
    } else if (channel_preview.canPlayType("application/vnd.apple.mpegurl")) {
        channel_preview.src = streamUrl;
        channel_preview.load();

        channel_preview.addEventListener("loadedmetadata", () => {

            channel_preview.play();

            const home_loading = document.getElementById("home-loading");
            if (!home_loading) return false;
            home_loading.classList.add("hidden");

            const main_section = document.getElementById("main-section");
            if (!main_section) return false;
            main_section.classList.remove("blur-md");

        });

    }

    if (selectedChannelObject[0].epg)  {

        const list_epg = document.getElementById("list-epg");
        if (list_epg) {
            list_epg.innerHTML = "";
            list_epg.innerHTML = `
                <li>
                    <div class="shadow-xl">
                        <h1 class="text-white text-2xl font-semibold">${selectedChannelObject[0].epg.currentProgram} | ${selectedChannelObject[0].name}</h1>
                        <p class="text-gray-400">Start Time: ${selectedChannelObject[0].epg.startTime} End Time: ${selectedChannelObject[0].epg.endTime} | ${selectedChannelObject[0].epg.progressPercentage}%</p>
                    </div>
                </li>
            `
        }

    }
    
}

async function loadChannelsBySelect(selectedInedx) {

    const list_channels = document.getElementById("list-channels");
    if (!list_channels) return false;

    const channels = await getChannesFromCountryAPI();
    if (!channels) return false;

    list_channels.innerHTML = "";

    const result = channels.filter(code => {

        if (selectedInedx == 0)
            return true;
        
        if (selectedInedx == 1)
            return code.isFavorite === true;

    })

    result.forEach(data => list_channels.innerHTML += requestRenderChannels(data))

}

export function loadChannelEvents() {
    const ul_channels = document.getElementById("list-channels");
    if (!ul_channels) return;

    let hlsElement = null;

    ul_channels.addEventListener("click", async (event) => {
        
        const listItem = event.target.closest("li");
        if (!listItem || !listItem.id) return;

        const channelsObject = await getChannesFromCountryAPI();
        if (!channelsObject) return;

        const selectedChannel = channelsObject.find(channel => channel.id === listItem.id);
        if (!selectedChannel) return;

        const channel_preview = document.getElementById("channel-preview");
        if (!channel_preview) return;

        const streamUrl = selectedChannel.streamUrl;
        
        if (hlsElement) {
            hlsElement.destroy();
            hlsElement = null;
        }

        if (Hls.isSupported()) {
            hlsElement = new Hls();
            hlsElement.loadSource(streamUrl);
            hlsElement.attachMedia(channel_preview);
            hlsElement.on(Hls.Events.MANIFEST_PARSED, () => {
                channel_preview.play();
            });
        } else if (channel_preview.canPlayType("application/vnd.apple.mpegurl")) {
            channel_preview.src = streamUrl;
            channel_preview.load();
            channel_preview.play();
        }

        if (selectedChannel.epg) {
            const list_epg = document.getElementById("list-epg");
            if (list_epg) {
                list_epg.innerHTML = `
                    <li>
                        <div class="shadow-xl">
                            <h1 class="text-white text-2xl font-semibold">${selectedChannel.epg.currentProgram} | ${selectedChannel.name}</h1>
                            <p class="text-gray-400">Start Time: ${selectedChannel.epg.startTime} End Time: ${selectedChannel.epg.endTime} | ${selectedChannel.epg.progressPercentage}%</p>
                        </div>
                    </li>
                `;
            }
        }

        document.querySelectorAll("[data-active]").forEach(element => {
            const listItem_ = element.closest("li");
            if (listItem !== listItem_) {
                element.dataset.active = "false";
            } else {
                element.dataset.active = "true";
            }
        });
    
    });

    const search_channels = document.getElementById("search-channels");
    if (search_channels) {
        search_channels.addEventListener("input", () => {
            const containers_channels = document.querySelectorAll("[data-channel]");
            if (!containers_channels) return;

            const searchValue = search_channels.value.toLowerCase().trim();
            containers_channels.forEach(element => {
                element.classList.remove("hidden");
                const channelName = element.dataset.channel.toLowerCase().trim();
                if (!channelName.includes(searchValue)) {
                    element.classList.add("hidden");
                }
            });
        });
    }

    const select_channels = document.getElementById("select-channels");
    if (select_channels) {
        select_channels.addEventListener("change", () => {
            loadChannelsBySelect(select_channels.selectedIndex)
        });
    }

}