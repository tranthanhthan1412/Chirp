import mongoose from "mongoose";

// Con trỏ phải trỏ vào tin CUỐI đã trả về, không phải tin dư bị loại.
// _id là khóa phụ để không mất tin khi nhiều tin có cùng createdAt.
export function messagePageQuery(conversationId, cursor, rawLimit = 50) {
    if (!mongoose.isValidObjectId(conversationId)) throw new Error("ID cuộc trò chuyện không hợp lệ");
    const limit = Number(rawLimit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("limit phải từ 1 đến 100");
    const query = { conversationId };
    if (cursor) {
        let decoded;
        try { decoded = JSON.parse(Buffer.from(cursor, "base64url").toString()); }
        catch { throw new Error("Con trỏ không hợp lệ"); }
        const date = new Date(decoded.createdAt);
        if (Number.isNaN(date.getTime()) || !mongoose.isValidObjectId(decoded.id)) throw new Error("Con trỏ không hợp lệ");
        query.$or = [{ createdAt: { $lt: date } }, { createdAt: date, _id: { $lt: decoded.id } }];
    }
    return { query, limit };
}

export function messagePage(rows, limit) {
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);
    const last = items.at(-1);
    const nextCursor = hasMore ? Buffer.from(JSON.stringify({ createdAt: last.createdAt, id: String(last._id) })).toString("base64url") : null;
    return { messages: items.reverse(), nextCursor };
}
