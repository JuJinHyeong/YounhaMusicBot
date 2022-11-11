const escapeRegex = (string: string) => {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export default escapeRegex;