package ir.steedly.app.data.remote

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class NormalizeBaseUrlTest {

    @Test
    fun `bare ip and port gets scheme and api path`() {
        assertEquals("http://192.168.1.10:3000/api/", RetrofitClient.normalizeBaseUrl("192.168.1.10:3000"))
    }

    @Test
    fun `existing api path is not duplicated`() {
        assertEquals("http://192.168.1.10:3000/api/", RetrofitClient.normalizeBaseUrl("http://192.168.1.10:3000/api"))
        assertEquals("http://10.0.2.2:3000/api/", RetrofitClient.normalizeBaseUrl("  10.0.2.2:3000/api/  "))
    }

    @Test
    fun `https host keeps its scheme`() {
        assertEquals("https://api.steedly.ir/api/", RetrofitClient.normalizeBaseUrl("https://api.steedly.ir"))
    }

    @Test
    fun `sub path before api is kept`() {
        assertEquals("https://example.com/steedly/api/", RetrofitClient.normalizeBaseUrl("https://example.com/steedly/"))
    }

    @Test
    fun `invalid input returns null`() {
        assertNull(RetrofitClient.normalizeBaseUrl(""))
        assertNull(RetrofitClient.normalizeBaseUrl("   "))
        assertNull(RetrofitClient.normalizeBaseUrl("http://"))
    }

    @Test
    fun `relative upload paths resolve against the server root`() {
        val root = RetrofitClient.SERVER_ROOT
        assertEquals("$root/uploads/a.jpg", RetrofitClient.resolveUrl("/uploads/a.jpg"))
        assertEquals("https://cdn.example.com/a.jpg", RetrofitClient.resolveUrl("https://cdn.example.com/a.jpg"))
        assertNull(RetrofitClient.resolveUrl(null))
    }
}
