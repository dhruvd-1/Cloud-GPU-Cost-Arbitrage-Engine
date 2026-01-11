"""
Alert notification system for GPU pricing changes.

Production mapping:
- AWS: SNS (Simple Notification Service) + SES (email)
- GCP: Cloud Pub/Sub + SendGrid
- Azure: Azure Notification Hubs + SendGrid

For this project: Console logging with simulation
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum


class AlertType(Enum):
    """Alert type enumeration."""
    PRICE_DROP = "price_drop"
    ARBITRAGE_OPPORTUNITY = "arbitrage_opportunity"
    AVAILABILITY_CHANGE = "availability_change"
    ANOMALY_DETECTED = "anomaly_detected"


class AlertNotifier:
    """
    Alert notification system for GPU pricing events.

    In production, this would integrate with:
    - AWS SNS for pub/sub notifications
    - Email service (SES, SendGrid)
    - Slack/Discord webhooks
    - SMS via Twilio
    """

    def __init__(self, enabled: bool = True):
        """
        Initialize alert notifier.

        Args:
            enabled: Whether alerts are enabled
        """
        self.enabled = enabled
        self.alert_history: List[Dict[str, Any]] = []

    def send_alert(
        self,
        alert_type: AlertType,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Send an alert notification.

        Args:
            alert_type: Type of alert
            title: Alert title
            message: Alert message
            data: Additional data

        Returns:
            True if sent successfully
        """
        if not self.enabled:
            return False

        alert = {
            'type': alert_type.value,
            'title': title,
            'message': message,
            'data': data or {},
            'timestamp': datetime.utcnow().isoformat() + 'Z',
        }

        self.alert_history.append(alert)

        # Simulate notification (in production, this would call SNS/email/etc.)
        self._log_alert(alert)

        return True

    def _log_alert(self, alert: Dict[str, Any]) -> None:
        """Log alert to console (simulates sending notification)."""
        print("\n" + "="*60)
        print(f"🔔 ALERT: {alert['type'].upper()}")
        print("="*60)
        print(f"Title: {alert['title']}")
        print(f"Message: {alert['message']}")
        print(f"Time: {alert['timestamp']}")
        if alert['data']:
            print(f"Data: {alert['data']}")
        print("="*60 + "\n")

        # In production, this would be:
        # import boto3
        # sns = boto3.client('sns')
        # sns.publish(
        #     TopicArn='arn:aws:sns:us-east-1:123456789012:gpu-price-alerts',
        #     Subject=alert['title'],
        #     Message=alert['message']
        # )

    def alert_price_drop(
        self,
        gpu_model: str,
        provider: str,
        old_price: float,
        new_price: float,
        threshold_percent: float = 10.0,
    ) -> bool:
        """
        Alert on significant price drop.

        Args:
            gpu_model: GPU model name
            provider: Provider name
            old_price: Previous price
            new_price: New price
            threshold_percent: Minimum drop percentage to alert

        Returns:
            True if alert sent
        """
        price_drop = old_price - new_price
        drop_percent = (price_drop / old_price) * 100

        if drop_percent >= threshold_percent:
            return self.send_alert(
                alert_type=AlertType.PRICE_DROP,
                title=f"Price Drop: {gpu_model} on {provider}",
                message=f"{gpu_model} price dropped by {drop_percent:.1f}% on {provider}",
                data={
                    'gpu_model': gpu_model,
                    'provider': provider,
                    'old_price': old_price,
                    'new_price': new_price,
                    'savings_per_hour': round(price_drop, 2),
                    'drop_percent': round(drop_percent, 2),
                },
            )

        return False

    def alert_arbitrage_opportunity(
        self,
        gpu_model: str,
        cheap_provider: str,
        cheap_price: float,
        expensive_provider: str,
        expensive_price: float,
        savings_percent: float,
    ) -> bool:
        """
        Alert on arbitrage opportunity.

        Args:
            gpu_model: GPU model
            cheap_provider: Cheapest provider
            cheap_price: Cheapest price
            expensive_provider: Most expensive provider
            expensive_price: Most expensive price
            savings_percent: Percentage savings

        Returns:
            True if alert sent
        """
        return self.send_alert(
            alert_type=AlertType.ARBITRAGE_OPPORTUNITY,
            title=f"Arbitrage: {gpu_model} - Save {savings_percent:.1f}%",
            message=f"{gpu_model}: {cheap_provider} is {savings_percent:.1f}% cheaper than {expensive_provider}",
            data={
                'gpu_model': gpu_model,
                'cheap_provider': cheap_provider,
                'cheap_price': cheap_price,
                'expensive_provider': expensive_provider,
                'expensive_price': expensive_price,
                'savings_percent': round(savings_percent, 2),
                'hourly_savings': round(expensive_price - cheap_price, 2),
            },
        )

    def alert_availability_change(
        self,
        gpu_model: str,
        provider: str,
        old_availability: float,
        new_availability: float,
    ) -> bool:
        """
        Alert on significant availability change.

        Args:
            gpu_model: GPU model
            provider: Provider name
            old_availability: Previous availability
            new_availability: New availability

        Returns:
            True if alert sent
        """
        change = abs(new_availability - old_availability)

        if change >= 0.2:  # 20% change threshold
            return self.send_alert(
                alert_type=AlertType.AVAILABILITY_CHANGE,
                title=f"Availability Change: {gpu_model} on {provider}",
                message=f"{gpu_model} availability changed from {old_availability:.0%} to {new_availability:.0%}",
                data={
                    'gpu_model': gpu_model,
                    'provider': provider,
                    'old_availability': old_availability,
                    'new_availability': new_availability,
                    'change': round(change, 2),
                },
            )

        return False

    def get_alert_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get recent alert history.

        Args:
            limit: Maximum number of alerts to return

        Returns:
            List of recent alerts
        """
        return self.alert_history[-limit:]

    def clear_history(self) -> None:
        """Clear alert history."""
        self.alert_history.clear()


# Global notifier instance
_global_notifier = None


def get_notifier(enabled: bool = True) -> AlertNotifier:
    """
    Get global notifier instance (singleton).

    Args:
        enabled: Whether alerts are enabled

    Returns:
        Global AlertNotifier instance
    """
    global _global_notifier
    if _global_notifier is None:
        _global_notifier = AlertNotifier(enabled=enabled)
    return _global_notifier
