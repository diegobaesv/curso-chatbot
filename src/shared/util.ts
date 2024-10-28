export const extractPhoneNumber = (from: string)=>{
    return from.split('@')[0];
}

export const isContactMessage = (from: string) => {
    return from.split('@')[1] == 'c.us';
}

export const isGroupMessage = (from: string) => {
    return from.split('@')[1] == 'g.us';
}