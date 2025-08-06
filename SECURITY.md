# Security Configuration

This document outlines the security features implemented in the authentication system.

## Environment Variables

### Required Security Variables

```bash
# Bcrypt salt rounds for password hashing (default: 12)
# Higher values = more secure but slower
# Recommended: 10-14 for production
BCRYPT_SALT_ROUNDS=12

# JWT secret for signing tokens (required)
JWT_SECRET=your-secure-jwt-secret-here
```

### Rate Limiting Configuration

The authentication system includes built-in rate limiting to prevent:

- **User enumeration attacks** (checking if emails exist)
- **Brute force login attempts**
- **Registration spam**

#### Default Rate Limits

- **Authentication attempts**: 5 per 15 minutes per IP/email
- **Email existence checks**: 3 per 15 minutes per IP
- **Failed login attempts**: 3 per 15 minutes per email (60% of max attempts)

#### Rate Limiting Features

1. **IP-based limiting**: Prevents attacks from single sources
2. **Email-based limiting**: Prevents targeted attacks on specific accounts
3. **Type-specific limits**: Different limits for login, registration, and email checks
4. **Serverless-friendly cleanup**: On-demand cleanup instead of setInterval to prevent memory leaks
5. **Consistent timing**: Database queries have consistent timing to prevent timing attacks

## Security Measures Implemented

### 1. User Enumeration Prevention

- **Generic error messages**: Login and registration use the same error message for invalid credentials
- **Consistent timing**: All authentication operations take a minimum of 100ms
- **Rate limited email checks**: Prevents bulk email verification attempts

### 2. Password Security

- **Configurable bcrypt salt rounds**: Defaults to 12 rounds
- **Minimum length requirement**: 8 characters minimum
- **Secure hashing**: Uses bcryptjs with proper salt rounds

### 3. Rate Limiting

- **Multi-layer protection**: Both IP and email-based limits
- **Graduated responses**: Different limits for different operation types
- **Memory efficient**: Automatic cleanup of old attempt records

### 4. Database Query Security

- **Rate-limited queries**: All database queries go through the global rate limiter
- **Error handling**: Comprehensive error handling with security-conscious logging
- **Consistent responses**: Database errors don't leak information

### 5. Production Security

- **Environment-based logging**: Detailed logs in development, minimal in production
- **Error sanitization**: Internal errors are not exposed to users
- **Secure defaults**: Conservative default values for all security parameters

## API Endpoints

All rate limiting is handled internally within the authentication system. No external API endpoints are required for rate limiting functionality.

## Monitoring

The system logs the following security events:

- Failed authentication attempts
- Rate limit violations
- Database query errors (sanitized in production)
- User enumeration attempts

## Best Practices

1. **Monitor rate limit violations**: Set up alerts for excessive rate limit hits
2. **Review authentication logs**: Regular review of failed attempts
3. **Keep salt rounds updated**: Increase BCRYPT_SALT_ROUNDS as hardware improves
4. **Use strong JWT secrets**: Generate cryptographically secure JWT secrets
5. **Consider additional layers**: Add CAPTCHA for high-risk scenarios

## Compliance Notes

These security measures help with:

- **OWASP Top 10**: Protection against injection, broken authentication, and security misconfigurations
- **GDPR**: Proper data protection and security measures
- **PCI DSS**: Secure authentication practices (if handling payments)
- **SOC 2**: Security controls and monitoring capabilities
