export const isValidUUID = (uuid: string): boolean => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  };

export const isIntString = (value: string): boolean => {
    return /^[0-9]+$/.test(value);
};  