import { Bell, TrendingUp, Shield, Users } from "lucide-react";

const notifications = [
  {
    id: 1,
    type: "update",
    title: "Mining Phase Now Live",
    message: "Distributed mining has officially launched. Start earning GSC tokens today.",
    icon: TrendingUp,
    color: "gold",
  },
  {
    id: 2,
    type: "security",
    title: "Security Audit Complete",
    message: "Our smart contracts have been audited and verified by leading security firms.",
    icon: Shield,
    color: "success",
  },
  {
    id: 3,
    type: "community",
    title: "10,000 Users Milestone",
    message: "We've reached 10,000 registered users across 50+ countries worldwide.",
    icon: Users,
    color: "silver",
  },
];

const NotificationsSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              <span className="text-foreground">Latest </span>
              <span className="text-gradient-gold">Updates</span>
            </h2>
            <p className="text-muted-foreground">Stay informed with the latest GSC announcements</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-gold">
            <Bell className="w-5 h-5" />
            <span className="text-sm font-medium">{notifications.length} New</span>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <div
              key={notification.id}
              className="glass-card p-6 flex items-start gap-4 transition-all duration-300 hover:border-gold/20 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notification.color === "gold"
                    ? "bg-gold/10"
                    : notification.color === "success"
                    ? "bg-success/10"
                    : "bg-silver/10"
                }`}
              >
                <notification.icon
                  className={`w-6 h-6 ${
                    notification.color === "gold"
                      ? "text-gold"
                      : notification.color === "success"
                      ? "text-success"
                      : "text-silver"
                  }`}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NotificationsSection;
