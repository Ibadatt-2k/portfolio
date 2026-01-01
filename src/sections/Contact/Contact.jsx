"use client"

import { useState } from "react"
import styles from "./ContactStyles.module.css"
import { useScrollAnimation } from "../../hooks/useScrollAnimation"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // You can integrate with an email service here
      console.log("Form submitted:", formData)
      setSubmitStatus("success")
      setFormData({ name: "", email: "", message: "" })
      setTimeout(() => setSubmitStatus(""), 3000)
    } catch (error) {
      setSubmitStatus("error")
      setTimeout(() => setSubmitStatus(""), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const { ref: containerRef, isVisible: containerVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section className={styles.contactSection}>
      <div ref={containerRef} className={`${styles.contactContainer} scroll-rotate ${containerVisible ? 'visible' : ''}`}>
        <h2 className={styles.title}>Lets's Talk ..</h2>
        <p className={styles.subtitle}>Send me a message and I'll get back to you as soon as possible</p>

        <form action="https://formspree.io/f/xeoonkeb" method="post" className={styles.formBox}>
          {/* Name Input */}
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
              className={styles.input}
            />
          </div>

          {/* Email Input */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
              className={styles.input}
            />
          </div>

          {/* Message Input */}
          <div className={styles.formGroup}>
            <label htmlFor="message" className={styles.label}>
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your message here..."
              required
              rows="6"
              className={styles.textarea}
            />
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>

          {/* Status Message */}
          {submitStatus === "success" && <p className={styles.successMessage}>Message sent successfully!</p>}
          {submitStatus === "error" && <p className={styles.errorMessage}>Failed to send message. Please try again.</p>}
        </form>
      </div>
    </section>
  )
}
