package ir.steedly.app.utils

import android.icu.text.SimpleDateFormat as IcuDateFormat
import android.icu.util.ULocale
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

private val persianLocale = Locale("fa", "IR")
private val jalaliLocale = ULocale("fa_IR@calendar=persian")

/** 1250000.0 -> "۱٬۲۵۰٬۰۰۰ تومان" */
fun formatToman(amount: Double?): String =
    NumberFormat.getInstance(persianLocale).format((amount ?: 0.0).toLong()) + " تومان"

fun formatNumber(value: Number): String = NumberFormat.getInstance(persianLocale).format(value)

/**
 * Parses the ISO timestamps the backend returns ("2024-05-01T10:30:00.000Z")
 * and date-only strings ("2024-05-01").
 */
fun parseApiDate(value: String?): Date? {
    if (value.isNullOrBlank()) return null
    val patterns = listOf(
        "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'" to TimeZone.getTimeZone("UTC"),
        "yyyy-MM-dd'T'HH:mm:ss'Z'" to TimeZone.getTimeZone("UTC"),
        "yyyy-MM-dd'T'HH:mm:ss" to TimeZone.getDefault(),
        "yyyy-MM-dd" to TimeZone.getDefault()
    )
    for ((pattern, zone) in patterns) {
        try {
            val format = SimpleDateFormat(pattern, Locale.US).apply {
                timeZone = zone
                isLenient = false
            }
            return format.parse(value) ?: continue
        } catch (e: Exception) {
            // try next pattern
        }
    }
    return null
}

/** Formats as a Persian (Jalali) date, e.g. "۱۴۰۳/۰۲/۱۲" (optionally with time). */
fun formatJalaliDate(value: String?, withTime: Boolean = false): String {
    val date = parseApiDate(value) ?: return value ?: ""
    return formatJalaliDate(date, withTime)
}

fun formatJalaliDate(date: Date, withTime: Boolean = false): String {
    val pattern = if (withTime) "yyyy/MM/dd - HH:mm" else "yyyy/MM/dd"
    return IcuDateFormat(pattern, jalaliLocale).format(date)
}

/** Long form, e.g. "۱۲ اردیبهشت ۱۴۰۳" */
fun formatJalaliLong(value: String?): String {
    val date = parseApiDate(value) ?: return value ?: ""
    return IcuDateFormat("d MMMM yyyy", jalaliLocale).format(date)
}

/** Local date/time -> ISO string the backend stores in a TIMESTAMP column. */
fun toApiDateTime(date: Date): String =
    SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).format(date)

object StatusLabels {
    fun order(status: String) = when (status) {
        "pending" -> "در انتظار"
        "processing" -> "در حال پردازش"
        "shipped" -> "ارسال شده"
        "delivered" -> "تحویل داده شده"
        "cancelled" -> "لغو شده"
        else -> status
    }

    fun payment(status: String) = when (status) {
        "pending" -> "در انتظار پرداخت"
        "paid" -> "پرداخت شده"
        "failed" -> "پرداخت ناموفق"
        "refunded" -> "بازگشت وجه"
        else -> status
    }

    fun booking(status: String) = when (status) {
        "pending" -> "در انتظار تأیید"
        "confirmed" -> "تأیید شده"
        "completed" -> "انجام شده"
        "cancelled" -> "لغو شده"
        else -> status
    }

    fun competitionType(type: String?) = when (type) {
        "race" -> "اسب‌دوانی"
        "jumping" -> "پرش با اسب"
        "dressage" -> "درساژ"
        "polo" -> "چوگان"
        "endurance" -> "استقامت"
        null -> ""
        else -> type
    }
}
