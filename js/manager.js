import { createChannel } from "./api.js"

function toggleCreateChannelPopOut() {

    const popout_element = document.getElementById("popout-create-channels");
    if (!popout_element) return false;
    
    popout_element.classList.toggle("hidden");
    
    const span_notification = document.getElementById("notification-new-channel");
    if (!span_notification) return false;
    span_notification.classList.add("hidden");
    span_notification.textContent = "";

    return true;

}

export function loadManagerEvents() {

    const popout_channels_element = document.getElementById("popout-create-channels");
    if (popout_channels_element) {
        popout_channels_element.addEventListener("click", (event) => {
            if (event.currentTarget === event.target)
                popout_channels_element.classList.add("hidden");
        })
    }

    const btn_add_channels = document.getElementById("btn-add-channel");
    if (btn_add_channels) {
        btn_add_channels.addEventListener("click", () => {
            toggleCreateChannelPopOut();
        })
    }

    const btn_close_channels = document.getElementById("btn-close-channels");
    if (btn_close_channels) {
        btn_close_channels.addEventListener("click", () => {
            toggleCreateChannelPopOut();
        })
    }

    const btn_create_channel = document.getElementById("btn-create-channel");
    if (!btn_create_channel) return false;

    btn_create_channel.addEventListener("click", () => {

        const span_notification = document.getElementById("notification-new-channel");

        const input_channel_number = document.getElementById("input-channel-number");
        const input_channel_name = document.getElementById("input-channel-name");
        const input_channel_logoURL = document.getElementById("input-channel-logoURL");
        const input_channel_streamURL = document.getElementById("input-channel-streamURL");

        const select_channel_country = document.getElementById("select-channel-country");
        const select_channel_category = document.getElementById("select-channel-category");

        const regexNumber = /^[0-9]+$/;
        const regexName = /^(?!\s*$).+/s;
        const regexLogoURL = /^https?:\/\/(?:[\w-]+\.)+[a-zA-Z]{2,}(?::\d{1,5})?\/[^\s?#]+\.(?:png|jpe?g)(?:\?[^\s#]*)?$/i;
        const regexStreamURL = /^https?:\/\/(?:[\w-]+\.)+[a-zA-Z]{2,}(?::\d{1,5})?\/[^\s?#]+\.m3u8(?:\?[^\s#]*)?$/i;;

        if (!regexNumber.test(input_channel_number.value)) {
            span_notification.classList.remove("hidden");
            span_notification.textContent = "Please type valid channel number !";
            return false;
        }

        if (!regexName.test(input_channel_name.value)) {
            span_notification.classList.remove("hidden");
            span_notification.textContent = "Please type valid channel name !";
            return false;
        }

        if (!regexLogoURL.test(input_channel_logoURL.value)) {
            span_notification.classList.remove("hidden");
            span_notification.textContent = "Please type valid channel logo url (PNG|JPG|JPEG) !";
            return false;
        }

        if (!regexStreamURL.test(input_channel_streamURL.value)) {
            span_notification.classList.remove("hidden");
            span_notification.textContent = "Please type valid channel stream url (M3U8) !";
            return false;
        }

        if (select_channel_country.selectedIndex === 0 || select_channel_category.selectedIndex === 0) {
            span_notification.classList.remove("hidden");
            span_notification.textContent = "Please select category or country of this channel !";
            return false;
        }

        const cache = {
            "channelNumber": input_channel_number.value,
            "countryCode": select_channel_country.value,
            "name": `${select_channel_country.value} - ${input_channel_name.value}`,
            "category": select_channel_category.value,
            "logo": input_channel_logoURL.value,
            "previewImage": `https://via.placeholder.com/800x450?text=${input_channel_name.value.replaceAll(" ", "+")}`,
            "streamUrl": input_channel_streamURL.value,
            "isLive": true,
            "isFavorite": false,
            "isBlacklisted": false,
            "epg": {
                "currentProgram": "Live Broadcast",
                "startTime": "20:00",
                "endTime": "21:00",
                "progressPercentage": 87
            }
        };

        createChannel(cache);
        toggleCreateChannelPopOut();

    })

}