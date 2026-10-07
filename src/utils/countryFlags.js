import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en);

const countryFlags = {
    England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿"
};

export function getCountryFlag(country) {
    if (!country) return "🌐";

    const countryCode = countries.getAlpha2Code(country, "en");

    if (countryCode) {
        return countryCode
            .toUpperCase()
            .replace(/./g, (char) =>
                String.fromCodePoint(127397 + char.charCodeAt())
            );
    }

    if (countryFlags[country]) {
        return countryFlags[country];
    }

    return "🌐";
}